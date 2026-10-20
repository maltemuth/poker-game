/**
 * Tests for what each audience sees: a seated player's own hole cards and
 * buttons and best hand, spectators seeing no hole cards, shown hands at
 * showdown, and stacks during a hand.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { assertMatchObject } from "../helpers/assert.js";
import { addSpectator } from "../../src/table/addSpectator.js";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import { audienceOf, SPECTATORS } from "../../src/views/audiences.js";
import { viewTable } from "../../src/views/viewTable.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const draw = () => deck(["AhAs", "KdKc", "QhQs"], 0, "2c7d9hJs3c");
// a (button) is to act; b and c have the blinds
const playing = () =>
  addSpectator(
    startNextHand(tableWith([seated("a"), seated("b"), seated("c")]), draw()),
    { playerId: "s", name: "Sue" }
  );

it("shows a seated player their own hole cards only", () => {
  const view = viewTable(playing(), "b");
  assert.deepEqual(
    view.hand?.players.map((player) => player.cards),
    [null, ["Kd", "Kc"], null]
  );
  assertMatchObject(view.you, { playerId: "b", seat: 2, buttons: [] });
});

it("shows spectators no hole cards", () => {
  const view = viewTable(playing(), SPECTATORS);
  assert.equal(
    view.hand?.players.every((player) => player.cards === null),
    true
  );
  assert.equal(view.you, null);
  assert.deepEqual(view.spectators, [{ playerId: "s", name: "Sue" }]);
});

it("gives the player to act their buttons", () => {
  const view = viewTable(playing(), "a");
  assert.equal(view.hand?.toAct, 1);
  assert.deepEqual(
    view.you?.buttons.map((button) => button.type),
    ["fold", "call", "raise", "allIn"]
  );
});

it("shows stacks without the chips in the middle during a hand", () => {
  const view = viewTable(playing(), SPECTATORS);
  assert.deepEqual(
    view.seats.slice(0, 3).map((seat) => seat?.stack),
    [1000, 950, 900]
  );
  assert.deepEqual(
    view.hand?.players.map((player) => player.bet),
    [0, 50, 100]
  );
});

it("keeps a folded player's cards visible to them", () => {
  const d = draw();
  const table = applyTableAction(
    startNextHand(tableWith([seated("a"), seated("b"), seated("c")]), d),
    "a",
    { type: "fold" },
    d
  );
  assert.deepEqual(viewTable(table, "a").hand?.players[0].cards, ["Ah", "As"]);
  assert.equal(viewTable(table, "b").hand?.players[0].cards, null);
});

it("shows every hand at showdown, to everyone", () => {
  const d = draw();
  let table = startNextHand(
    tableWith([seated("a"), seated("b"), seated("c")]),
    d
  );
  table = applyTableAction(table, "a", { type: "allIn" }, d);
  table = applyTableAction(table, "b", { type: "call" }, d);
  table = applyTableAction(table, "c", { type: "fold" }, d);
  const view = viewTable(table, SPECTATORS);
  assert.equal(view.hand?.board.length, 5);
  assert.deepEqual(
    view.hand?.players.map((player) => player.cards),
    [["Ah", "As"], ["Kd", "Kc"], null]
  );
  assert.deepEqual(
    view.hand?.result?.shown.map((shown) => shown.type),
    ["pair", "pair"]
  );
});

it("gives seated players their own audience, and everyone else the spectators'", () => {
  const table = playing();
  assert.equal(audienceOf(table, "a"), "a");
  assert.equal(audienceOf(table, "s"), SPECTATORS);
  assert.equal(audienceOf(table, "nobody"), SPECTATORS);
  assert.deepEqual(viewTable(table, "nobody"), viewTable(table, SPECTATORS));
});

it("is plain JSON, and the same every time", () => {
  const table = playing();
  const view = viewTable(table, "b");
  assert.deepEqual(JSON.parse(JSON.stringify(view)), view);
  assert.deepEqual(viewTable(table, "b"), view);
});

it("shows the tabled hands to everyone once no more betting is possible", () => {
  const d = draw();
  let table = startNextHand(
    tableWith([seated("a"), seated("b"), seated("c")], {
      options: { ...emptyTable().options, runoutDelay: 1000 },
    }),
    d
  );
  table = applyTableAction(table, "a", { type: "allIn" }, d);
  table = applyTableAction(table, "b", { type: "call" }, d);
  table = applyTableAction(table, "c", { type: "fold" }, d);
  const view = viewTable(table, SPECTATORS);
  assertMatchObject(view.hand, { tabled: true, board: [], result: null });
  assert.deepEqual(
    view.hand?.players.map((player) => player.cards),
    [["Ah", "As"], ["Kd", "Kc"], null]
  );
});

it("shows spectators every hole card at a table that allows it, and players still only theirs", () => {
  const table = startNextHand(
    tableWith([seated("a"), seated("b"), seated("c")], {
      options: { ...emptyTable().options, spectatorsSeeHoleCards: true },
    }),
    draw()
  );
  assert.deepEqual(
    viewTable(table, SPECTATORS).hand?.players.map((p) => p.cards),
    [
      ["Ah", "As"],
      ["Kd", "Kc"],
      ["Qh", "Qs"],
    ]
  );
  assert.deepEqual(
    viewTable(table, "b").hand?.players.map((p) => p.cards),
    [null, ["Kd", "Kc"], null]
  );
});

it("ranks the viewer's best hand with the board so far, from two cards", () => {
  const table = playing();
  assertMatchObject(viewTable(table, "b").you!.bestHand, {
    type: "pair",
    best: ["Kd", "Kc"],
  });
  const flop = {
    ...table,
    hand: { ...table.hand!, board: ["Kh", "7d", "7c"] },
  };
  assertMatchObject(viewTable(flop, "b").you!.bestHand, {
    type: "fullHouse",
    best: ["Kd", "Kc", "Kh", "7d", "7c"],
  });
});

it("gives no best hand to someone not dealt in, or to spectators", () => {
  const table = playing();
  const late = applyTableAction(
    table,
    "s",
    { type: "sitDown", seat: 5, buyIn: 1000 },
    draw()
  );
  assert.equal(viewTable(late, "s").you?.bestHand, null);
  assert.equal(viewTable(table, SPECTATORS).you, null);
});
