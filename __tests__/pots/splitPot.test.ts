/**
 * Tests for splitting one pot among the best ranks that can win it.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { splitPot } from "../../src/pots/splitPot.js";

const order = [2, 3, 1];

it("gives the pot to the best rank", () => {
  assert.deepEqual(
    splitPot({ amount: 900, seats: [1, 2, 3] }, { 1: 5, 2: 9, 3: 7 }, order),
    [{ seat: 2, amount: 900 }]
  );
});

it("shares the pot on a tie", () => {
  assert.deepEqual(
    splitPot({ amount: 900, seats: [1, 2, 3] }, { 1: 9, 2: 5, 3: 9 }, order),
    [
      { seat: 3, amount: 450 },
      { seat: 1, amount: 450 },
    ]
  );
});

it("gives odd chips one each in odd-chip order", () => {
  assert.deepEqual(
    splitPot({ amount: 1001, seats: [1, 2, 3] }, { 1: 9, 2: 9, 3: 9 }, order),
    [
      { seat: 2, amount: 334 },
      { seat: 3, amount: 334 },
      { seat: 1, amount: 333 },
    ]
  );
});

it("considers only the seats that can win the pot", () => {
  // seat 2 has the best hand, but isn't in this side pot
  assert.deepEqual(
    splitPot({ amount: 400, seats: [1, 3] }, { 1: 5, 2: 9, 3: 7 }, order),
    [{ seat: 3, amount: 400 }]
  );
});

it("needs no rank when only one seat can win", () => {
  assert.deepEqual(splitPot({ amount: 150, seats: [3] }, {}, order), [
    { seat: 3, amount: 150 },
  ]);
});

it("refuses a contested pot with a seat without a rank", () => {
  assert.throws(
    () => splitPot({ amount: 900, seats: [1, 2] }, { 1: 5 }, order),
    { message: "Seat 2 has no rank" }
  );
});
