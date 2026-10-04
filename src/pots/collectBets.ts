/**
 * The end of a betting round (decision 0003): the uncalled part of the last
 * bet goes back to its player, the bets in front of the players go into the
 * pots, and the pots are computed again from every seat's total for the
 * hand. Collecting twice gives the same round.
 *
 * Starting the next street and awarding the pots collect the bets
 * themselves, so a round end can't be missed.
 */

import type { BettingRound } from "../betting/BettingRound.js";
import { pots } from "./pots.js";
import { returnUncalledBet } from "./uncalledBet.js";

/**
 * @throws {Error} If the round isn't over
 */
export const collectBets = (round: BettingRound): BettingRound => {
  if (round.toAct !== null) throw new Error("The betting round isn't over");
  const seats = returnUncalledBet(round.seats);
  return {
    ...round,
    seats: seats.map((seat) => ({ ...seat, bet: 0 })),
    currentBet: 0,
    pots: pots(seats),
  };
};
