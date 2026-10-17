/**
 * Tests for betting at the table: only the player to act, buttons
 * translated, and the hand settled when it ends.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
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
  assert.equal(after.hand?.betting.seats[0].bet, 300);
});

it("refuses players whose turn it isn't, or who aren't in the hand", () => {
  const table = playing();
  assert.equal(checkBet(table, "b", { type: "call" }), "It's not your turn");
  assert.equal(
    checkBet(table, "eve", { type: "call" }),
    "You aren't in this hand"
  );
  assert.equal(
    checkBet(tableWith([seated("a")]), "a", { type: "call" }),
    "No hand is being played"
  );
});

it("passes on the reasons of the translation and the rules", () => {
  const table = playing();
  assert.equal(
    checkBet(table, "a", { type: "check" }),
    "You can't check: there's 100 to call"
  );
  assert.equal(
    checkBet(table, "a", { type: "raise", to: 150 }),
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
  assert.notEqual(table.hand?.result, null);
  assert.deepEqual(
    table.seats.slice(0, 3).map((seat) => seat?.stack),
    [1000, 950, 1050]
  );
});
