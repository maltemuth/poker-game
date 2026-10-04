/**
 * Folds any seat still in the hand, whether it's their turn or not: a player
 * who stands up folds at once (decision 0009). In turn, it's an ordinary
 * fold. Out of turn, the player to act stays the same unless the fold
 * changes who must act: when it leaves only one player in the hand, or no
 * one left to bet against, the round is over.
 */

import type { BettingRound } from "./BettingRound.js";
import { applyAction } from "./applyAction.js";
import { nextToAct } from "./nextToAct.js";
import { isInHand } from "./seatStatus.js";

/**
 * @throws {Error} If the seat isn't in the hand
 */
export const foldSeat = (round: BettingRound, index: number): BettingRound => {
  const seat = round.seats[index];
  if (!seat || !isInHand(seat)) throw new Error("The seat isn't in the hand");
  if (round.toAct === index) return applyAction(round, { type: "fold" });

  const folded = {
    ...round,
    seats: round.seats.map((other, i) =>
      i === index ? { ...other, folded: true } : other
    ),
  };
  if (folded.toAct === null) return folded;
  // look again from the player to act: they, or the next one who must, or no one
  const before = (folded.toAct - 1 + folded.seats.length) % folded.seats.length;
  return { ...folded, toAct: nextToAct(folded, before) };
};
