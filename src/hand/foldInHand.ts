/**
 * Folds a player's hand whether it's their turn or not, as when they stand
 * up (decision 0009), and moves the hand on as after any fold: dealing the
 * next cards when the betting round is over, or ending the hand.
 */

import { foldSeat } from "../betting/foldSeat.js";
import { continueHand } from "./continueHand.js";
import type { Draw } from "./Draw.js";
import type { Hand } from "./Hand.js";

/**
 * @param index - Index into the hand's betting seats
 * @throws {Error} If the hand is over, or the seat isn't in it
 */
export const foldInHand = (hand: Hand, index: number, draw: Draw): Hand => {
  if (hand.result) throw new Error("The hand is over");
  return continueHand(
    { ...hand, betting: foldSeat(hand.betting, index) },
    draw
  );
};
