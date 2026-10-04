/**
 * Where a seat stands in the hand. A seat that hasn't folded is still in the
 * hand; with no chips left, it's all-in and can't act any more, but it can
 * still win.
 */

import type { BettingSeat } from "./BettingRound.js";

/** Not folded: the seat can still win a pot */
export const isInHand = (seat: BettingSeat): boolean => !seat.folded;

/** In the hand, with no chips left to bet */
export const isAllIn = (seat: BettingSeat): boolean =>
  isInHand(seat) && seat.stack === 0;

/** In the hand, with chips left: the seat can still act */
export const canAct = (seat: BettingSeat): boolean =>
  isInHand(seat) && seat.stack > 0;
