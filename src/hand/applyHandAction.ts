/**
 * The hand after the player to act's action: the betting rules apply it, the
 * next turn begins, and the hand moves on as far as it goes, dealing the
 * next cards or ending the hand when a betting round is over.
 */

import type { BettingAction } from "../betting/BettingAction.js";
import { applyAction } from "../betting/applyAction.js";
import { checkHandAction } from "./checkHandAction.js";
import { continueHand } from "./continueHand.js";
import type { Draw } from "./Draw.js";
import type { Hand } from "./Hand.js";

/**
 * @throws {Error} If `checkHandAction` rejects the action
 */
export const applyHandAction = (
  hand: Hand,
  action: BettingAction,
  draw: Draw
): Hand => {
  const accepted = checkHandAction(hand, action);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  return continueHand(
    {
      ...hand,
      betting: applyAction(hand.betting, action),
      turn: hand.turn + 1,
    },
    draw
  );
};
