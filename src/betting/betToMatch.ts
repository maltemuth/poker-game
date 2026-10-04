/**
 * What a seat must bring its bet in this betting round up to, to stay in the hand.
 *
 * That's the current bet, unless no one else in the hand can act any more.
 * Then the seat only has to match what the others actually bet: if a short
 * big blind is all-in for less than the small blind, there's nothing left
 * to call, and nothing more would be called.
 */

import type { BettingRound } from "./BettingRound.js";
import { canAct, isInHand } from "./seatStatus.js";

/** Whether another seat than the one at `index` can still act */
export const othersCanAct = (round: BettingRound, index: number): boolean =>
  round.seats.some((other, i) => i !== index && canAct(other));

export const betToMatch = (round: BettingRound, index: number): number => {
  if (othersCanAct(round, index)) return round.currentBet;
  const othersBets = round.seats
    .filter((other, i) => i !== index && isInHand(other))
    .map((other) => other.bet);
  return Math.min(round.currentBet, Math.max(0, ...othersBets));
};
