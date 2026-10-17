/**
 * The timers in a Remote State server, with real timers and short delays:
 * hands start by themselves once two players sit down, and again after each
 * hand, with the button moving; a turn that runs out folds.
 */

import assert from "node:assert/strict";
import { it, before, after } from "node:test";
import { assertMatchObject } from "../helpers/assert.js";
import {
  createRemoteStateServer,
  type RemoteStateServer,
  silentLogger,
} from "@malte.muth/remote-state";
import request from "supertest";
import type { HoldemAction } from "../../src/plugin/HoldemAction.js";
import { createHoldemPlugin } from "../../src/plugin/createHoldemPlugin.js";
import { newTable } from "../../src/table/newTable.js";
import type { Table } from "../../src/table/Table.js";
import type { TableView } from "../../src/views/TableView.js";
import { options } from "../helpers/table.js";

let server: RemoteStateServer<Table>;

before(async () => {
  server = await createRemoteStateServer(createHoldemPlugin(), {
    logger: silentLogger,
  });
});

after(() => server.close());

const join = async (gameId: string, name: string) => {
  const code = await server.admit({ gameId, identity: { id: name, name } });
  return (
    await request(server.app).post("/api/tokens").send({ code }).expect(201)
  ).body as { token: string };
};

const send = (gameId: string, token: string, action: HoldemAction) =>
  request(server.app)
    .post(`/api/games/${gameId}/actions`)
    .set("Authorization", `Bearer ${token}`)
    .send({ action })
    .expect(201);

const view = async (gameId: string, token: string): Promise<TableView> =>
  (
    await request(server.app)
      .get(`/api/games/${gameId}/state`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
  ).body.state;

/** Waits until the view shows what's expected, or fails after a second */
const eventually = async (
  read: () => Promise<TableView>,
  expected: (view: TableView) => boolean
) => {
  for (let tries = 0; tries < 50; tries++) {
    const current = await read();
    if (expected(current)) return current;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error("The view never showed what was expected");
};

it("starts hands by themselves, after each hand too", async () => {
  const gameId = await server.createGame(
    newTable({ ...options, nextHandDelay: 50 })
  );
  const ann = await join(gameId, "Ann");
  const bob = await join(gameId, "Bob");
  await send(gameId, ann.token, { type: "sitDown", seat: 1, buyIn: 1000 });
  assert.equal((await view(gameId, ann.token)).hand, null);
  await send(gameId, bob.token, { type: "sitDown", seat: 2, buyIn: 1000 });

  // the second player sat down: a hand starts by itself, Ann on the button
  const first = await eventually(
    () => view(gameId, ann.token),
    (v) => v.hand !== null && v.hand.result === null
  );
  assert.equal(first.hand?.button, 1);

  // Ann folds; the next hand starts by itself, with the button moved
  await send(gameId, ann.token, { type: "fold" });
  const second = await eventually(
    () => view(gameId, ann.token),
    (v) => v.hand?.result === null && v.hand.button === 2
  );
  // after the first hand, Ann has 950 and Bob 1,050; now Bob (button) has
  // posted the small blind and Ann the big blind
  assert.deepEqual(
    second.seats.map((seat) => seat?.stack).slice(0, 2),
    [850, 1000]
  );
});

it("starts no hands while paused, and again on resume", async () => {
  const gameId = await server.createGame(
    newTable({ ...options, nextHandDelay: 50 })
  );
  const ann = await join(gameId, "Ann");
  const bob = await join(gameId, "Bob");
  await server.act(gameId, { type: "pause" });
  await send(gameId, ann.token, { type: "sitDown", seat: 1, buyIn: 1000 });
  await send(gameId, bob.token, { type: "sitDown", seat: 2, buyIn: 1000 });
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.equal((await view(gameId, ann.token)).hand, null);

  await server.act(gameId, { type: "resume" });
  await eventually(
    () => view(gameId, ann.token),
    (v) => v.hand !== null && v.hand.result === null
  );
});

it("leaves starting hands to the host without a delay", async () => {
  const gameId = await server.createGame(
    newTable({ ...options, nextHandDelay: null })
  );
  const ann = await join(gameId, "Ann");
  const bob = await join(gameId, "Bob");
  await send(gameId, ann.token, { type: "sitDown", seat: 1, buyIn: 1000 });
  await send(gameId, bob.token, { type: "sitDown", seat: 2, buyIn: 1000 });
  await new Promise((resolve) => setTimeout(resolve, 150));
  assert.equal((await view(gameId, ann.token)).hand, null);
});

it("folds a player whose turn runs out, after a player who acted in time", async () => {
  const gameId = await server.createGame(
    newTable({ ...options, nextHandDelay: null, turnTimeout: 100 })
  );
  const ann = await join(gameId, "Ann");
  const bob = await join(gameId, "Bob");
  await send(gameId, ann.token, { type: "sitDown", seat: 1, buyIn: 1000 });
  await send(gameId, bob.token, { type: "sitDown", seat: 2, buyIn: 1000 });
  await server.act(gameId, { type: "startHand" });

  // heads-up: Ann, on the button, calls in time; Bob could check, but doesn't act
  await send(gameId, ann.token, { type: "call" });
  const over = await eventually(
    () => view(gameId, ann.token),
    (v) => v.hand?.result !== null
  );
  assert.equal(over.hand?.players[1].folded, true);
  assert.deepEqual(
    over.seats.map((seat) => seat?.stack).slice(0, 2),
    [1100, 900]
  );
});

it("deals an all-in runout one betting round at a time, with the hands tabled", async () => {
  const gameId = await server.createGame(
    newTable({ ...options, nextHandDelay: null, runoutDelay: 100 })
  );
  const ann = await join(gameId, "Ann");
  const bob = await join(gameId, "Bob");
  const sue = await join(gameId, "Sue");
  await send(gameId, ann.token, { type: "sitDown", seat: 1, buyIn: 1000 });
  await send(gameId, bob.token, { type: "sitDown", seat: 2, buyIn: 1000 });
  await server.act(gameId, { type: "startHand" });
  await send(gameId, ann.token, { type: "allIn" });
  await send(gameId, bob.token, { type: "call" });

  // at once: both hands face up for the spectator, no board yet
  const tabled = await view(gameId, sue.token);
  assertMatchObject(tabled.hand, { tabled: true, board: [], result: null });
  assert.equal(
    tabled.hand?.players.every((p) => p.cards !== null),
    true
  );

  // then the flop, the turn, and the river with the showdown
  await eventually(
    () => view(gameId, sue.token),
    (v) => v.hand?.board.length === 3
  );
  await eventually(
    () => view(gameId, sue.token),
    (v) => v.hand?.board.length === 4
  );
  const done = await eventually(
    () => view(gameId, sue.token),
    (v) => v.hand?.result !== null
  );
  assert.equal(done.hand?.board.length, 5);
});
