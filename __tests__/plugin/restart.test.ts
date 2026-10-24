/**
 * Tests for a table across a server restart: interrupted if it had a timer to
 * lose, left alone otherwise; resumed by the host with every timer it calls
 * for; and the same in a real Remote State server restarted on its database.
 */

import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join as joinPath } from "node:path";
import { after, describe, it } from "node:test";
import {
  createRemoteStateServer,
  type RemoteStateServer,
  silentLogger,
} from "@malte.muth/remote-state";
import request from "supertest";
import { createHoldemPlugin } from "../../src/plugin/createHoldemPlugin.js";
import type { HoldemAction } from "../../src/plugin/HoldemAction.js";
import { NEXT_HAND } from "../../src/plugin/nextHandTimer.js";
import { onRestart, timersFor } from "../../src/plugin/restart.js";
import { TURN } from "../../src/plugin/turnTimer.js";
import { newTable } from "../../src/table/newTable.js";
import { pause } from "../../src/table/pause.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import type { Table } from "../../src/table/Table.js";
import type { TableView } from "../../src/views/TableView.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, options, seated, tableWith } from "../helpers/table.js";

const two = tableWith([seated("a"), seated("b")]);
const dealt = startNextHand(two, deck(["AhAs", "KdKc"], 0, "2c7d9h"));

describe("onRestart", () => {
  it("interrupts a table with a turn running, or a hand to start", () => {
    assert.equal(onRestart(dealt).interrupted, true);
    assert.equal(onRestart(two).interrupted, true);
  });

  it("leaves a table with no timer to lose as it was, the same object", () => {
    for (const table of [
      emptyTable(),
      pause(two),
      tableWith([seated("a"), seated("b")], {
        options: { ...two.options, nextHandDelay: null },
      }),
    ]) {
      assert.equal(onRestart(table), table);
    }
    const interrupted = onRestart(dealt);
    assert.equal(onRestart(interrupted), interrupted);
  });

  it("is resumed by the host, with every timer the table calls for", async () => {
    const plugin = createHoldemPlugin();
    const interrupted = onRestart(dealt);
    const resumed = await plugin.executeAction(
      interrupted,
      { type: "resume" },
      "system"
    );
    // a transition: the resumed table, with its timers
    const { state, changes } = resumed as unknown as {
      state: Table;
      changes: { schedule: unknown[] };
    };
    assert.equal(state.interrupted, false);
    assert.deepEqual(changes.schedule, timersFor(dealt));
    assert.deepEqual(
      timersFor(dealt).map((timer) => [timer.name, timer.in]),
      [[TURN, dealt.options.turnTimeout]]
    );
    assert.deepEqual(
      timersFor(two).map((timer) => timer.name),
      [NEXT_HAND]
    );
  });
});

describe("a real server, restarted on its database", () => {
  const directory = mkdtempSync(joinPath(tmpdir(), "poker-game-restart-"));
  const database = joinPath(directory, "tables.db");
  let server: RemoteStateServer<Table>;
  // `after` hooks run in the order they're declared: close the database
  // before removing its directory, which Windows refuses while it's open
  after(() => server.close());
  after(() => rmSync(directory, { recursive: true, force: true }));

  const start = async () => {
    server = await createRemoteStateServer(createHoldemPlugin(), {
      logger: silentLogger,
      database,
    });
  };
  const join = async (spaceId: string, name: string) => {
    const code = await server.admit({ spaceId, identity: { id: name, name } });
    return (
      await request(server.app).post("/api/tokens").send({ code }).expect(201)
    ).body as { token: string; memberId: string };
  };
  const send = (spaceId: string, token: string, action: HoldemAction) =>
    request(server.app)
      .post(`/api/spaces/${spaceId}/actions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ action });
  const view = async (spaceId: string, token: string): Promise<TableView> =>
    (
      await request(server.app)
        .get(`/api/spaces/${spaceId}/state`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200)
    ).body.state;

  it("interrupts a hand being played, until the host resumes it", async () => {
    await start();
    const spaceId = await server.createSpace(
      newTable({ ...options, nextHandDelay: null, turnTimeout: 100 })
    );
    const ann = await join(spaceId, "ann");
    const bob = await join(spaceId, "bob");
    await send(spaceId, ann.token, { type: "sitDown", seat: 1, buyIn: 1000 });
    await send(spaceId, bob.token, { type: "sitDown", seat: 2, buyIn: 1000 });
    assert.ok(
      "sequence" in (await server.dispatch(spaceId, { type: "startHand" }))
    );

    await server.close();
    await start();

    const interrupted = await view(spaceId, ann.token);
    assert.equal(interrupted.interrupted, true);
    assert.deepEqual(interrupted.you?.buttons, []);
    const refused = await send(spaceId, ann.token, { type: "call" }).expect(
      400
    );
    assert.deepEqual(refused.body, {
      error: "The table is waiting for the host to resume it",
    });
    // the turn's clock doesn't run: well past the timeout, the hand still waits
    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.equal((await view(spaceId, ann.token)).hand?.result, null);

    await server.dispatch(spaceId, { type: "resume" });
    assert.equal((await view(spaceId, ann.token)).interrupted, false);
    // the turn starts over with its full time, and runs out
    for (let tries = 0; tries < 50; tries++) {
      if ((await view(spaceId, ann.token)).hand?.result) return;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    throw new Error("The resumed turn never ran out");
  });
});
