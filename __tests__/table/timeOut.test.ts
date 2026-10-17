/**
 * Tests for a turn running out: the player to act folds, and a timeout for a
 * turn that's over is refused.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import { checkTimeOut, currentTurn, timeOut } from "../../src/table/timeOut.js";
import { deck } from "../helpers/hand.js";
import { seated, tableWith } from "../helpers/table.js";

const draw = () => deck(["AhAs", "KdKc", "QhQs"], 0, "2c7d9h");
const playing = () =>
  startNextHand(tableWith([seated("a"), seated("b"), seated("c")]), draw());

it("numbers hands and turns", () => {
  const table = playing();
  assert.equal(table.handNumber, 1);
  assert.deepEqual(currentTurn(table), { hand: 1, turn: 0 });
  const d = draw();
  const after = applyTableAction(
    startNextHand(tableWith([seated("a"), seated("b"), seated("c")]), d),
    "a",
    { type: "call" },
    d
  );
  assert.deepEqual(currentTurn(after), { hand: 1, turn: 1 });
});

it("folds the player to act, even when they could check", () => {
  const d = draw();
  let table = startNextHand(
    tableWith([seated("a"), seated("b"), seated("c")]),
    d
  );
  table = applyTableAction(table, "a", { type: "call" }, d);
  table = applyTableAction(table, "b", { type: "call" }, d);
  // c, the big blind, could check, but the turn runs out
  table = timeOut(table, { hand: 1, turn: 2 }, d);
  assert.equal(table.hand?.betting.seats[2].folded, true);
  assert.equal(table.hand?.bettingRound, "flop");
});

it("refuses a timeout for a turn that's over", () => {
  const d = draw();
  const table = applyTableAction(playing(), "a", { type: "call" }, d);
  assert.equal(checkTimeOut(table, { hand: 1, turn: 0 }), "That turn is over");
  assert.equal(checkTimeOut(table, { hand: 0, turn: 1 }), "That turn is over");
  assert.equal(
    checkTimeOut(tableWith([seated("a")]), { hand: 0, turn: 0 }),
    "That turn is over"
  );
});

it("settles the hand when the timeout ends it", () => {
  const d = deck(["AhAs", "KdKc"], 0);
  let table = startNextHand(tableWith([seated("a"), seated("b")]), d);
  table = timeOut(table, { hand: 1, turn: 0 }, d);
  assert.notEqual(table.hand?.result, null);
  assert.deepEqual(
    table.seats.slice(0, 2).map((s) => s?.stack),
    [950, 1050]
  );
});
