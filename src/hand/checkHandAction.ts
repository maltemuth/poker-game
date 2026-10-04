/**
 * Accepts a betting action in a hand, or says why not: the betting rules
 * decide while the hand is played, and nothing is accepted once it's over.
 * Buttons are translated with `translateUiAction` on the hand's `betting`
 * first.
 */

import type { BettingAction } from "../betting/BettingAction.js";
import { checkAction } from "../betting/checkAction.js";
import type { Hand } from "./Hand.js";

/** `true` if the player to act may take `action`, otherwise the reason */
export const checkHandAction = (
  hand: Hand,
  action: BettingAction
): true | string =>
  hand.result ? "The hand is over" : checkAction(hand.betting, action);
