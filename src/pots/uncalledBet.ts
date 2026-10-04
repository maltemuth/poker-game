/**
 * The part of a bet no one called goes back to the player who made it: what
 * the seat with the highest total put in above the next highest total, folded
 * seats included, since their chips did match up to their total. If everyone
 * folds to a bet, or a call is all-in for less, the rest of the bet is
 * returned.
 *
 * Bets are collected at the end of every betting round (decision 0003), so
 * an uncalled part is always part of the bet on the street.
 */

import type { BettingSeat } from "../betting/BettingRound.js";

/** The seats with the uncalled part of the highest total given back */
export const returnUncalledBet = (seats: BettingSeat[]): BettingSeat[] => {
  if (seats.length < 2) return seats;
  const totals = seats.map((seat) => seat.committed);
  const highest = Math.max(...totals);
  const top = totals.indexOf(highest);
  const next = Math.max(...totals.filter((_, index) => index !== top));
  const uncalled = highest - next;
  if (uncalled === 0) return seats;

  const seat = seats[top];
  if (uncalled > seat.bet) {
    throw new Error("An uncalled bet from an earlier street wasn't returned");
  }
  const returned: BettingSeat = {
    ...seat,
    stack: seat.stack + uncalled,
    bet: seat.bet - uncalled,
    committed: seat.committed - uncalled,
  };
  return seats.map((other, index) => (index === top ? returned : other));
};
