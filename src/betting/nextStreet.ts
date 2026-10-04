/**
 * The betting round of the next street, once the current one is over. The
 * bets of the street stay in what each seat has committed to the hand, and
 * the new street starts with no bet, a minimum bet of the big blind, and the
 * first player left of the button to act. Heads-up, that's the big blind.
 *
 * If at most one player can still act, no one does: the board is dealt out
 * without betting.
 */

import type { BettingRound } from "./BettingRound.js";
import { nextToAct } from "./nextToAct.js";
import { isInHand } from "./seatStatus.js";

/**
 * @throws {Error} If the round isn't over, or only one player is left in the
 *   hand; then the hand is over, and there's no next street.
 */
export const nextStreet = (round: BettingRound): BettingRound => {
  if (round.toAct !== null) throw new Error("The betting round isn't over");
  if (round.seats.filter(isInHand).length < 2) {
    throw new Error("Only one player is left in the hand");
  }
  const next: BettingRound = {
    ...round,
    seats: round.seats.map((seat) => ({ ...seat, bet: 0, actedAt: null })),
    currentBet: 0,
    minRaise: round.bigBlind,
  };
  return { ...next, toAct: nextToAct(next, round.button) };
};
