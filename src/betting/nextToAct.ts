/**
 * Who acts next in a betting round, going clockwise. A seat must act if it
 * owes chips to the current bet, or if it hasn't acted on this street yet
 * and someone else could still bet against it. When no seat must act, the
 * round is over.
 */

import type { BettingRound, BettingSeat } from "./BettingRound.js";
import { canAct, isInHand } from "./seatStatus.js";

const mustAct = (
  seat: BettingSeat,
  round: BettingRound,
  seatsAbleToAct: number
): boolean =>
  canAct(seat) &&
  (seat.bet < round.currentBet ||
    (seat.actedAt === null && seatsAbleToAct > 1));

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
  const seatsAbleToAct = seats.filter(canAct).length;
  for (let step = 1; step <= seats.length; step++) {
    const index = (after + step) % seats.length;
    if (mustAct(seats[index], round, seatsAbleToAct)) return index;
  }
  return null;
};
