/**
 * Tests for folding a hand out of turn: the hand goes on, or ends when only
 * one player is left.
 */

import { foldInHand } from "../../src/hand/foldInHand.js";
import { startHand } from "../../src/hand/startHand.js";
import { deck, players } from "../helpers/hand.js";

const blinds = { small: 50, big: 100 };

it("folds out of turn, and the hand goes on", () => {
  const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
  const hand = startHand(players(1000, 1000, 1000), 0, blinds, draw);
  // seat 1 (the button) is to act; the big blind folds
  const after = foldInHand(hand, 2, draw);
  expect(after.betting.seats[2].folded).toBe(true);
  expect(after.betting.toAct).toBe(0);
  expect(after.result).toBeNull();
});

it("ends the hand when only one player is left", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const hand = startHand(players(1000, 1000), 0, blinds, draw);
  // heads-up: the button is to act; the big blind folds out of turn
  const after = foldInHand(hand, 1, draw);
  expect(after.result?.awards).toEqual([[{ seat: 1, amount: 150 }]]);
});

it("refuses once the hand is over", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const over = foldInHand(
    startHand(players(1000, 1000), 0, blinds, draw),
    1,
    draw
  );
  expect(() => foldInHand(over, 0, draw)).toThrow("The hand is over");
});
