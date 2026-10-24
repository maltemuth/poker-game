/**
 * The plugin in a Remote State server, driven through its HTTP API as a
 * host and its clients would: admitting people, sitting down, the host
 * starting a hand, betting, and each audience's view of the cards.
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
import { deck } from "../helpers/hand.js";
import { options } from "../helpers/table.js";

let server: RemoteStateServer<Table>;

before(async () => {
  // seat 1 has the button: seat 2 gets the first card
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c");
  server = await createRemoteStateServer(createHoldemPlugin({ draw }), {
    logger: silentLogger,
  });
});

after(() => server.close());

/** Admits someone and redeems the code, as a host and its client do */
const join = async (spaceId: string, name: string) => {
  const code = await server.admit({ spaceId, identity: { id: name, name } });
  const { body } = await request(server.app)
    .post("/api/tokens")
    .send({ code })
    .expect(201);
  return body as { memberId: string; token: string };
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

it("plays a hand: seats, the host's start, bets, and views", async () => {
  const spaceId = await server.createSpace(newTable(options));
  const ann = await join(spaceId, "Ann");
  const bob = await join(spaceId, "Bob");
  const sue = await join(spaceId, "Sue");

  // everyone starts as a spectator
  assert.deepEqual(
    (await view(spaceId, ann.token)).spectators.map((p) => p.name),
    ["Ann", "Bob", "Sue"]
  );

  await send(spaceId, ann.token, {
    type: "sitDown",
    seat: 1,
    buyIn: 2000,
  }).expect(201);
  await send(spaceId, bob.token, {
    type: "sitDown",
    seat: 2,
    buyIn: 2000,
  }).expect(201);

  // players can't start hands; the host can
  const refused = await send(spaceId, ann.token, { type: "startHand" }).expect(
    400
  );
  assert.ok(refused.text.includes("Only the host can do that"));
  assert.ok(
    "sequence" in (await server.dispatch(spaceId, { type: "startHand" }))
  );

  // each player sees their own cards; the spectator sees none
  const annView = await view(spaceId, ann.token);
  assertMatchObject(annView.you, { seat: 1 });
  assert.deepEqual(
    annView.hand?.players.map((p) => p.cards),
    [["Ah", "As"], null]
  );
  assert.deepEqual(
    (await view(spaceId, bob.token)).hand?.players.map((p) => p.cards),
    [null, ["Kd", "Kc"]]
  );
  const sueView = await view(spaceId, sue.token);
  assert.equal(sueView.you, null);
  assert.equal(
    sueView.hand?.players.every((p) => p.cards === null),
    true
  );

  // heads-up, Ann (button) acts first; Bob can't act out of turn
  assert.ok(annView.you?.buttons.map((b) => b.type).includes("call"));
  const early = await send(spaceId, bob.token, { type: "check" }).expect(400);
  assert.ok(early.text.includes("It's not your turn"));

  await send(spaceId, ann.token, { type: "allIn" }).expect(201);
  await send(spaceId, bob.token, { type: "call" }).expect(201);

  // showdown: everyone sees both hands; Bob is out of chips and watches now
  const after = await view(spaceId, sue.token);
  assert.deepEqual(after.hand?.board, ["2c", "7d", "9h", "Js", "3c"]);
  assert.deepEqual(
    after.hand?.players.map((p) => p.cards),
    [
      ["Ah", "As"],
      ["Kd", "Kc"],
    ]
  );
  assert.equal(after.seats[0]?.stack, 4000);
  assert.equal(after.seats[1], null);
  assert.equal((await view(spaceId, bob.token)).you, null);
});

it("rejects actions the rules refuse, with their reason", async () => {
  const spaceId = await server.createSpace(newTable(options));
  const ann = await join(spaceId, "Ann");
  const tooSmall = await send(spaceId, ann.token, {
    type: "sitDown",
    seat: 1,
    buyIn: 10,
  }).expect(400);
  assert.ok(
    tooSmall.text.includes(
      "The buy-in must be a whole number of chips from 1000 to 5000"
    )
  );
  assert.deepEqual(await server.dispatch(spaceId, { type: "startHand" }), {
    rejected: "Waiting for players",
  });
});
