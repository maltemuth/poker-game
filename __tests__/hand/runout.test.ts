/**
 * Tests for all-in runouts: the hands still in are tabled once no more
 * betting is possible, and a paced runout deals one betting round's cards
 * at a time.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { assertMatchObject } from "../helpers/assert.js";
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
  assert.equal(hand.tabled, true);
  assert.equal(hand.board.length, 5);
  assert.notEqual(hand.result, null);
});

it("tables the hands and waits for each betting round's cards with pacing", () => {
  const { draw, hand: tabled } = allInAndCall(true);
  let hand = tabled;
  assertMatchObject(hand, { tabled: true, board: [], result: null });
  assert.equal(waitsForRunout(hand), true);

  hand = dealRunout(hand, draw);
  assert.deepEqual(hand.board, ["2c", "7d", "9h"]);
  assert.equal(hand.bettingRound, "flop");
  assert.equal(waitsForRunout(hand), true);

  hand = dealRunout(hand, draw);
  assert.equal(hand.board.length, 4);

  // the river comes with the showdown
  hand = dealRunout(hand, draw);
  assert.equal(hand.board.length, 5);
  assert.deepEqual(hand.result?.awards, [[{ seat: 1, amount: 2000 }]]);
  assert.equal(waitsForRunout(hand), false);
});

it("tables when one player still has chips but no one to bet against", () => {
  const draw = deck(["AhAs", "KdKc", "QhQs"], 0, "2c7d9hJs3c");
  // seat 2 is short and all-in; seats 1 and 3 call and check it down
  let hand = startHand(players(2000, 300, 2000), 0, blinds, draw, {
    pacedRunout: true,
  });
  hand = applyHandAction(hand, { type: "bet", to: 2000 }, draw); // seat 1 all-in
  hand = applyHandAction(hand, { type: "bet", to: 300 }, draw); // seat 2 all-in
  assert.equal(hand.tabled, false); // seat 3 still to act
  hand = applyHandAction(hand, { type: "bet", to: 2000 }, draw); // seat 3 calls all-in
  assert.equal(hand.tabled, true);
  assert.equal(waitsForRunout(hand), true);
});

it("doesn't table hands while betting goes on", () => {
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9h");
  let hand = startHand(players(1000, 1000), 0, blinds, draw, {
    pacedRunout: true,
  });
  hand = applyHandAction(hand, { type: "bet", to: 100 }, draw);
  hand = applyHandAction(hand, { type: "bet", to: 100 }, draw);
  assert.equal(hand.bettingRound, "flop");
  assert.equal(hand.tabled, false);
});

it("refuses to deal a runout to a hand that isn't waiting for one", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const hand = startHand(players(1000, 1000), 0, blinds, draw, {
    pacedRunout: true,
  });
  assert.throws(() => dealRunout(hand, draw), {
    message: "The hand isn't waiting for a runout",
  });
});
