/**
 * Tests for what each audience sees: a seated player's own hole cards and
 * buttons, spectators seeing no hole cards, shown hands at showdown, and
 * stacks during a hand.
 */

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
  expect(view.hand?.players.map((player) => player.cards)).toEqual([
    null,
    ["Kd", "Kc"],
    null,
  ]);
  expect(view.you).toMatchObject({ playerId: "b", seat: 2, buttons: [] });
});

it("shows spectators no hole cards", () => {
  const view = viewTable(playing(), SPECTATORS);
  expect(view.hand?.players.every((player) => player.cards === null)).toBe(
    true
  );
  expect(view.you).toBeNull();
  expect(view.spectators).toEqual([{ playerId: "s", name: "Sue" }]);
});

it("gives the player to act their buttons", () => {
  const view = viewTable(playing(), "a");
  expect(view.hand?.toAct).toBe(1);
  expect(view.you?.buttons.map((button) => button.type)).toEqual([
    "fold",
    "call",
    "raise",
    "allIn",
  ]);
});

it("shows stacks without the chips in the middle during a hand", () => {
  const view = viewTable(playing(), SPECTATORS);
  expect(view.seats.slice(0, 3).map((seat) => seat?.stack)).toEqual([
    1000, 950, 900,
  ]);
  expect(view.hand?.players.map((player) => player.bet)).toEqual([0, 50, 100]);
});

it("keeps a folded player's cards visible to them", () => {
  const d = draw();
  const table = applyTableAction(
    startNextHand(tableWith([seated("a"), seated("b"), seated("c")]), d),
    "a",
    { type: "fold" },
    d
  );
  expect(viewTable(table, "a").hand?.players[0].cards).toEqual(["Ah", "As"]);
  expect(viewTable(table, "b").hand?.players[0].cards).toBeNull();
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
  expect(view.hand?.board).toHaveLength(5);
  expect(view.hand?.players.map((player) => player.cards)).toEqual([
    ["Ah", "As"],
    ["Kd", "Kc"],
    null,
  ]);
  expect(view.hand?.result?.shown.map((shown) => shown.type)).toEqual([
    "pair",
    "pair",
  ]);
});

it("gives seated players their own audience, and everyone else the spectators'", () => {
  const table = playing();
  expect(audienceOf(table, "a")).toBe("a");
  expect(audienceOf(table, "s")).toBe(SPECTATORS);
  expect(audienceOf(table, "nobody")).toBe(SPECTATORS);
  expect(viewTable(table, "nobody")).toEqual(viewTable(table, SPECTATORS));
});

it("is plain JSON, and the same every time", () => {
  const table = playing();
  const view = viewTable(table, "b");
  expect(JSON.parse(JSON.stringify(view))).toEqual(view);
  expect(viewTable(table, "b")).toEqual(view);
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
  expect(view.hand).toMatchObject({ tabled: true, board: [], result: null });
  expect(view.hand?.players.map((player) => player.cards)).toEqual([
    ["Ah", "As"],
    ["Kd", "Kc"],
    null,
  ]);
});

it("shows spectators every hole card at a table that allows it, and players still only theirs", () => {
  const table = startNextHand(
    tableWith([seated("a"), seated("b"), seated("c")], {
      options: { ...emptyTable().options, spectatorsSeeHoleCards: true },
    }),
    draw()
  );
  expect(
    viewTable(table, SPECTATORS).hand?.players.map((p) => p.cards)
  ).toEqual([
    ["Ah", "As"],
    ["Kd", "Kc"],
    ["Qh", "Qs"],
  ]);
  expect(viewTable(table, "b").hand?.players.map((p) => p.cards)).toEqual([
    null,
    ["Kd", "Kc"],
    null,
  ]);
});
