/**
 * Who acts next in a betting round, going clockwise. A seat must act if it
 * owes chips to the bet it has to match, or if it hasn't acted in this
 * betting round yet and someone else could still bet against it. When no seat must
 * act, the round is over.
 */

import type { BettingRound } from "./BettingRound.js";
import { betToMatch, othersCanAct } from "./betToMatch.js";
import { canAct, isInHand } from "./seatStatus.js";

const mustAct = (round: BettingRound, index: number): boolean => {
  const seat = round.seats[index];
  if (!canAct(seat)) return false;
  return (
    seat.bet < betToMatch(round, index) ||
    (seat.actedAt === null && othersCanAct(round, index))
  );
};

/**
 * The index of the first seat after `after` that must act, or null if the
 * round is over: everyone has acted and matched the bet or is all-in, or
 * only one seat is left in the hand.
 */
export const nextToAct = (
  round: BettingRound,
  after: number
): number | null => {
  const { seats } = round;
  if (seats.filter(isInHand).length < 2) return null;
  for (let step = 1; step <= seats.length; step++) {
    const index = (after + step) % seats.length;
    if (mustAct(round, index)) return index;
  }
  return null;
};
