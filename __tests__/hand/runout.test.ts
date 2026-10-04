/**
 * Tests for all-in runouts: the hands still in are tabled once no more
 * betting is possible, and a paced runout deals one betting round's cards
 * at a time.
 */

import { applyHandAction } from "../../src/hand/applyHandAction.js";
import { dealRunout, waitsForRunout } from "../../src/hand/dealRunout.js";
import { startHand } from "../../src/hand/startHand.js";
import { deck, players } from "../helpers/hand.js";

const blinds = { small: 50, big: 100 };
const allInAndCall = (pacedRunout: boolean) => {
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c");
  let hand = startHand(players(1000, 1000), 0, blinds, draw, { pacedRunout });
  hand = applyHandAction(hand, { type: "bet", to: 1000 }, draw);
  hand = applyHandAction(hand, { type: "bet", to: 1000 }, draw);
  return { hand, draw };
};

it("tables the hands and deals the rest at once without pacing", () => {
  const { hand } = allInAndCall(false);
  expect(hand.tabled).toBe(true);
  expect(hand.board).toHaveLength(5);
  expect(hand.result).not.toBeNull();
});

it("tables the hands and waits for each betting round's cards with pacing", () => {
  const { draw, hand: tabled } = allInAndCall(true);
  let hand = tabled;
  expect(hand).toMatchObject({ tabled: true, board: [], result: null });
  expect(waitsForRunout(hand)).toBe(true);

  hand = dealRunout(hand, draw);
  expect(hand.board).toEqual(["2c", "7d", "9h"]);
  expect(hand.bettingRound).toBe("flop");
  expect(waitsForRunout(hand)).toBe(true);

  hand = dealRunout(hand, draw);
  expect(hand.board).toHaveLength(4);

  // the river comes with the showdown
  hand = dealRunout(hand, draw);
  expect(hand.board).toHaveLength(5);
  expect(hand.result?.awards).toEqual([[{ seat: 1, amount: 2000 }]]);
  expect(waitsForRunout(hand)).toBe(false);
});

it("tables when one player still has chips but no one to bet against", () => {
  const draw = deck(["AhAs", "KdKc", "QhQs"], 0, "2c7d9hJs3c");
  // seat 2 is short and all-in; seats 1 and 3 call and check it down
  let hand = startHand(players(2000, 300, 2000), 0, blinds, draw, {
    pacedRunout: true,
  });
  hand = applyHandAction(hand, { type: "bet", to: 2000 }, draw); // seat 1 all-in
  hand = applyHandAction(hand, { type: "bet", to: 300 }, draw); // seat 2 all-in
  expect(hand.tabled).toBe(false); // seat 3 still to act
  hand = applyHandAction(hand, { type: "bet", to: 2000 }, draw); // seat 3 calls all-in
  expect(hand.tabled).toBe(true);
  expect(waitsForRunout(hand)).toBe(true);
});

it("doesn't table hands while betting goes on", () => {
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9h");
  let hand = startHand(players(1000, 1000), 0, blinds, draw, {
    pacedRunout: true,
  });
  hand = applyHandAction(hand, { type: "bet", to: 100 }, draw);
  hand = applyHandAction(hand, { type: "bet", to: 100 }, draw);
  expect(hand.bettingRound).toBe("flop");
  expect(hand.tabled).toBe(false);
});

it("refuses to deal a runout to a hand that isn't waiting for one", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const hand = startHand(players(1000, 1000), 0, blinds, draw, {
    pacedRunout: true,
  });
  expect(() => dealRunout(hand, draw)).toThrow(
    "The hand isn't waiting for a runout"
  );
});
