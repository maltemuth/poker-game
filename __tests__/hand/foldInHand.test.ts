/**
 * Tests for folding a hand out of turn: the hand goes on, or ends when only
 * one player is left.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { foldInHand } from "../../src/hand/foldInHand.js";
import { startHand } from "../../src/hand/startHand.js";
import { deck, players } from "../helpers/hand.js";

const blinds = { small: 50, big: 100 };

it("folds out of turn, and the hand goes on", () => {
  const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
  const hand = startHand(players(1000, 1000, 1000), 0, blinds, draw);
  // seat 1 (the button) is to act; the big blind folds
  const after = foldInHand(hand, 2, draw);
  assert.equal(after.betting.seats[2].folded, true);
  assert.equal(after.betting.toAct, 0);
  assert.equal(after.result, null);
});

it("ends the hand when only one player is left", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const hand = startHand(players(1000, 1000), 0, blinds, draw);
  // heads-up: the button is to act; the big blind folds out of turn
  const after = foldInHand(hand, 1, draw);
  assert.deepEqual(after.result?.awards, [[{ seat: 1, amount: 150 }]]);
});

it("refuses once the hand is over", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const over = foldInHand(
    startHand(players(1000, 1000), 0, blinds, draw),
    1,
    draw
  );
  assert.throws(() => foldInHand(over, 0, draw), {
    message: "The hand is over",
  });
});

it("starts a new turn only for a fold in turn", () => {
  const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
  const hand = startHand(players(1000, 1000, 1000), 0, blinds, draw);
  assert.equal(foldInHand(hand, 2, draw).turn, 0);
  assert.equal(foldInHand(hand, 0, draw).turn, 1);
});
