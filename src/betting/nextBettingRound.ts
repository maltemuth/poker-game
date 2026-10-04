/**
 * The next betting round, once the current one is over. The bets of the
 * round are collected into the pots first (decision 0003), and the new
 * round starts with no bet, a minimum bet of the big blind, and the
 * first player left of the button to act. Heads-up, that's the big blind.
 *
 * If at most one player can still act, no one does: the board is dealt out
 * without betting.
 */

import type { BettingRound } from "./BettingRound.js";
import { collectBets } from "../pots/collectBets.js";
import { nextToAct } from "./nextToAct.js";
import { isInHand } from "./seatStatus.js";

/**
 * @throws {Error} If the round isn't over, or only one player is left in the
 *   hand; then the hand is over, and there's no next betting round.
 */
export const nextBettingRound = (round: BettingRound): BettingRound => {
  if (round.toAct !== null) throw new Error("The betting round isn't over");
  if (round.seats.filter(isInHand).length < 2) {
    throw new Error("Only one player is left in the hand");
  }
  const collected = collectBets(round);
  const next: BettingRound = {
    ...collected,
    seats: collected.seats.map((seat) => ({ ...seat, actedAt: null })),
    minRaise: round.bigBlind,
  };
  return { ...next, toAct: nextToAct(next, round.button) };
};
