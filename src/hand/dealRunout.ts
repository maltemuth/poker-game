/**
 * The next step of a paced all-in runout (decision 0015): with the hands
 * tabled and no one able to bet, the next betting round's cards are dealt,
 * and after the river, the hand ends at showdown. Each step is one call, so
 * a timer can pace them.
 */

import { dealNext } from "./continueHand.js";
import type { Draw } from "./Draw.js";
import type { Hand } from "./Hand.js";

/** The hand is tabled and waits for the next runout cards */
export const waitsForRunout = (hand: Hand): boolean =>
  hand.result === null &&
  hand.tabled &&
  hand.pacedRunout &&
  hand.betting.toAct === null;

/**
 * @throws {Error} If the hand doesn't wait for runout cards
 */
export const dealRunout = (hand: Hand, draw: Draw): Hand => {
  if (!waitsForRunout(hand))
    throw new Error("The hand isn't waiting for a runout");
  const dealt = dealNext(hand, draw);
  return dealt.bettingRound === "river" && dealt.result === null
    ? dealNext(dealt, draw)
    : dealt;
};
