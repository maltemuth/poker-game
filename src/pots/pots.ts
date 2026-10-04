/**
 * The main pot and the side pots, computed from what each seat put into the
 * hand (decision 0003).
 *
 * Every different total among the seats still in the hand is a level: the
 * main pot holds what everyone put in up to the lowest level, the first side
 * pot what they put in between it and the next, and so on. A pot can be won
 * by the seats still in the hand that put in at least its level. Folded
 * seats' chips stay in the pots, but they can't win them; chips a folded seat
 * put in above every level go into the last pot.
 */

import type { BettingSeat } from "../betting/BettingRound.js";
import { isInHand } from "../betting/seatStatus.js";
import type { Pot } from "./Pot.js";

export type { Pot };

/** The pots for the seats' totals, the main pot first */
export const pots = (seats: BettingSeat[]): Pot[] => {
  const levels = [
    ...new Set(
      seats
        .filter(isInHand)
        .map((seat) => seat.committed)
        .filter((committed) => committed > 0)
    ),
  ].sort((a, b) => a - b);

  return levels.map((level, index) => {
    const below = index === 0 ? 0 : levels[index - 1];
    const last = index === levels.length - 1;
    const amount = seats.reduce(
      (sum, seat) =>
        sum +
        (last ? seat.committed : Math.min(seat.committed, level)) -
        Math.min(seat.committed, below),
      0
    );
    const winners = seats
      .filter((seat) => isInHand(seat) && seat.committed >= level)
      .map((seat) => seat.seat);
    return { amount, seats: winners };
  });
};
