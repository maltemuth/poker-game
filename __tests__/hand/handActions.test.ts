/**
 * Tests for acting in a hand: actions checked by the betting rules, the
 * hand moving on after them, and nothing accepted once it's over.
 */

import { applyHandAction } from "../../src/hand/applyHandAction.js";
import { checkHandAction } from "../../src/hand/checkHandAction.js";
import { startHand } from "../../src/hand/startHand.js";
import { deck, players } from "../helpers/hand.js";

const blinds = { small: 50, big: 100 };
const call = { type: "bet", to: 100 } as const;
const check = call;

it("deals the flop once the last player in the betting round acts", () => {
  const draw = deck(["AhAs", "KdKc"], 1, "2c7d9h");
  const hand = startHand(players(1000, 1000), 1, blinds, draw);
  // heads-up: the button (seat 2) calls, the big blind checks
  const flop = [call, check].reduce(
    (current, action) => applyHandAction(current, action, draw),
    hand
  );
  expect(flop.bettingRound).toBe("flop");
  expect(flop.board).toEqual(["2c", "7d", "9h"]);
});

it("passes rejections on from the betting rules", () => {
  const hand = startHand(
    players(1000, 1000),
    1,
    blinds,
    deck(["AhAs", "KdKc"], 1)
  );
  expect(checkHandAction(hand, { type: "bet", to: 150 })).toBe(
    "A raise must be to at least 200"
  );
  expect(() =>
    applyHandAction(hand, { type: "bet", to: 150 }, deck([], 0))
  ).toThrow("Invalid action: A raise must be to at least 200");
});

it("accepts nothing once the hand is over", () => {
  const draw = deck(["AhAs", "KdKc"], 1);
  const hand = startHand(players(1000, 1000), 1, blinds, draw);
  const over = applyHandAction(hand, { type: "fold" }, draw);
  expect(over.result).not.toBeNull();
  expect(checkHandAction(over, { type: "fold" })).toBe("The hand is over");
});

it("counts a turn for every action in turn", () => {
  const draw = deck(["AhAs", "KdKc"], 1, "2c7d9h");
  const hand = startHand(players(1000, 1000), 1, blinds, draw);
  expect(hand.turn).toBe(0);
  const flop = [call, check].reduce(
    (current, action) => applyHandAction(current, action, draw),
    hand
  );
  expect(flop.turn).toBe(2);
});
