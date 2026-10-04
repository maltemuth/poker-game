/**
 * Tests for betting at the table: only the player to act, buttons
 * translated, and the hand settled when it ends.
 */

import { bet, checkBet } from "../../src/table/bet.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import { deck } from "../helpers/hand.js";
import { seated, tableWith } from "../helpers/table.js";

const draw = () => deck(["AhAs", "KdKc", "QhQs"], 0);
// button seat 1, blinds seats 2 and 3: seat 1 ("a") acts first
const playing = () =>
  startNextHand(tableWith([seated("a"), seated("b"), seated("c")]), draw());

it("lets the player to act click a button", () => {
  const after = bet(playing(), "a", { type: "raise", to: 300 }, draw());
  expect(after.hand?.betting.seats[0].bet).toBe(300);
});

it("refuses players whose turn it isn't, or who aren't in the hand", () => {
  const table = playing();
  expect(checkBet(table, "b", { type: "call" })).toBe("It's not your turn");
  expect(checkBet(table, "eve", { type: "call" })).toBe(
    "You aren't in this hand"
  );
  expect(checkBet(tableWith([seated("a")]), "a", { type: "call" })).toBe(
    "No hand is being played"
  );
});

it("passes on the reasons of the translation and the rules", () => {
  const table = playing();
  expect(checkBet(table, "a", { type: "check" })).toBe(
    "You can't check: there's 100 to call"
  );
  expect(checkBet(table, "a", { type: "raise", to: 150 })).toBe(
    "A raise must be to at least 200"
  );
});

it("settles the hand when it ends", () => {
  const d = draw();
  let table = startNextHand(
    tableWith([seated("a"), seated("b"), seated("c")]),
    d
  );
  table = bet(table, "a", { type: "fold" }, d);
  table = bet(table, "b", { type: "fold" }, d);
  expect(table.hand?.result).not.toBeNull();
  expect(table.seats.slice(0, 3).map((seat) => seat?.stack)).toEqual([
    1000, 950, 1050,
  ]);
});
