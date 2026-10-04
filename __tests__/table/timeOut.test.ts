/**
 * Tests for a turn running out: the player to act folds, and a timeout for a
 * turn that's over is refused.
 */

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
  expect(table.handNumber).toBe(1);
  expect(currentTurn(table)).toEqual({ hand: 1, turn: 0 });
  const d = draw();
  const after = applyTableAction(
    startNextHand(tableWith([seated("a"), seated("b"), seated("c")]), d),
    "a",
    { type: "call" },
    d
  );
  expect(currentTurn(after)).toEqual({ hand: 1, turn: 1 });
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
  expect(table.hand?.betting.seats[2].folded).toBe(true);
  expect(table.hand?.bettingRound).toBe("flop");
});

it("refuses a timeout for a turn that's over", () => {
  const d = draw();
  const table = applyTableAction(playing(), "a", { type: "call" }, d);
  expect(checkTimeOut(table, { hand: 1, turn: 0 })).toBe("That turn is over");
  expect(checkTimeOut(table, { hand: 0, turn: 1 })).toBe("That turn is over");
  expect(checkTimeOut(tableWith([seated("a")]), { hand: 0, turn: 0 })).toBe(
    "That turn is over"
  );
});

it("settles the hand when the timeout ends it", () => {
  const d = deck(["AhAs", "KdKc"], 0);
  let table = startNextHand(tableWith([seated("a"), seated("b")]), d);
  table = timeOut(table, { hand: 1, turn: 0 }, d);
  expect(table.hand?.result).not.toBeNull();
  expect(table.seats.slice(0, 2).map((s) => s?.stack)).toEqual([950, 1050]);
});
