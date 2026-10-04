/**
 * Who gets the chips left over when a pot can't be split evenly among its
 * winners: one each, starting with the first winner left of the button and
 * going clockwise.
 */

import type { BettingRound } from "../betting/BettingRound.js";

/** The seat numbers of the round, clockwise from the first seat left of the button */
export const clockwiseFromButton = (round: BettingRound): number[] => {
  const { seats, button } = round;
  return seats.map((_, step) => seats[(button + 1 + step) % seats.length].seat);
};

/** `winners` in the order they get odd chips */
export const oddChipOrder = (
  round: BettingRound,
  winners: number[]
): number[] =>
  clockwiseFromButton(round).filter((seat) => winners.includes(seat));
