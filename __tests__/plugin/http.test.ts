/**
 * The plugin in a Remote State server, driven through its HTTP API as a
 * host and its clients would: admitting people, sitting down, the host
 * starting a hand, betting, and each audience's view of the cards.
 */

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

beforeAll(async () => {
  // seat 1 has the button: seat 2 gets the first card
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c");
  server = await createRemoteStateServer(createHoldemPlugin({ draw }), {
    logger: silentLogger,
  });
});

afterAll(() => server.close());

/** Admits someone and redeems the code, as a host and its client do */
const join = async (gameId: string, name: string) => {
  const code = await server.admit({ gameId, identity: { id: name, name } });
  const { body } = await request(server.app)
    .post("/api/tokens")
    .send({ code })
    .expect(201);
  return body as { playerId: string; token: string };
};

const send = (gameId: string, token: string, action: HoldemAction) =>
  request(server.app)
    .post(`/api/games/${gameId}/actions`)
    .set("Authorization", `Bearer ${token}`)
    .send({ action });

const view = async (gameId: string, token: string): Promise<TableView> =>
  (
    await request(server.app)
      .get(`/api/games/${gameId}/state`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
  ).body.state;

it("plays a hand: seats, the host's start, bets, and views", async () => {
  const gameId = await server.createGame(newTable(options));
  const ann = await join(gameId, "Ann");
  const bob = await join(gameId, "Bob");
  const sue = await join(gameId, "Sue");

  // everyone starts as a spectator
  expect((await view(gameId, ann.token)).spectators.map((p) => p.name)).toEqual(
    ["Ann", "Bob", "Sue"]
  );

  await send(gameId, ann.token, {
    type: "sitDown",
    seat: 1,
    buyIn: 2000,
  }).expect(201);
  await send(gameId, bob.token, {
    type: "sitDown",
    seat: 2,
    buyIn: 2000,
  }).expect(201);

  // players can't start hands; the host can
  const refused = await send(gameId, ann.token, { type: "startHand" }).expect(
    400
  );
  expect(refused.text).toContain("Only the host can do that");
  expect(await server.act(gameId, { type: "startHand" })).toHaveProperty(
    "sequence"
  );

  // each player sees their own cards; the spectator sees none
  const annView = await view(gameId, ann.token);
  expect(annView.you).toMatchObject({ seat: 1 });
  expect(annView.hand?.players.map((p) => p.cards)).toEqual([
    ["Ah", "As"],
    null,
  ]);
  expect(
    (await view(gameId, bob.token)).hand?.players.map((p) => p.cards)
  ).toEqual([null, ["Kd", "Kc"]]);
  const sueView = await view(gameId, sue.token);
  expect(sueView.you).toBeNull();
  expect(sueView.hand?.players.every((p) => p.cards === null)).toBe(true);

  // heads-up, Ann (button) acts first; Bob can't act out of turn
  expect(annView.you?.buttons.map((b) => b.type)).toContain("call");
  const early = await send(gameId, bob.token, { type: "check" }).expect(400);
  expect(early.text).toContain("It's not your turn");

  await send(gameId, ann.token, { type: "allIn" }).expect(201);
  await send(gameId, bob.token, { type: "call" }).expect(201);

  // showdown: everyone sees both hands; Bob is out of chips and watches now
  const after = await view(gameId, sue.token);
  expect(after.hand?.board).toEqual(["2c", "7d", "9h", "Js", "3c"]);
  expect(after.hand?.players.map((p) => p.cards)).toEqual([
    ["Ah", "As"],
    ["Kd", "Kc"],
  ]);
  expect(after.seats[0]?.stack).toBe(4000);
  expect(after.seats[1]).toBeNull();
  expect((await view(gameId, bob.token)).you).toBeNull();
});

it("rejects actions the rules refuse, with their reason", async () => {
  const gameId = await server.createGame(newTable(options));
  const ann = await join(gameId, "Ann");
  const tooSmall = await send(gameId, ann.token, {
    type: "sitDown",
    seat: 1,
    buyIn: 10,
  }).expect(400);
  expect(tooSmall.text).toContain(
    "The buy-in must be a whole number of chips from 1000 to 5000"
  );
  expect(await server.act(gameId, { type: "startHand" })).toEqual({
    rejected: "Waiting for players",
  });
});
