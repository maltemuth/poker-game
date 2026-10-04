/**
 * Translates a button into the betting rules' action, or says why the
 * button doesn't apply right now. Amounts are left to the rules: a raise to
 * too little passes through and is rejected by
 * [checkAction](../betting/checkAction.ts), with the rules' reason.
 *
 * - check: a bet to what the player already has in, if nothing is owed
 * - call: a bet to the call, if something is owed
 * - raise: a bet to `to`, which must be more than the call
 * - all-in: a bet to everything, as a call or a raise
 */

import type { BettingAction } from "../betting/BettingAction.js";
import type { BettingRound } from "../betting/BettingRound.js";
import { allowedBets } from "../betting/allowedBets.js";
import type { UiAction } from "./UiAction.js";

/** The rules' action for `uiAction` by the player to act, or why it doesn't apply */
export const translateUiAction = (
  round: BettingRound,
  uiAction: UiAction
): BettingAction | string => {
  const allowed = allowedBets(round);
  if (!allowed) return "The betting round is over";
  const seat = round.seats[allowed.index];
  const owed = allowed.call - seat.bet;

  switch (uiAction?.type) {
    case "fold":
      return { type: "fold" };
    case "check":
      if (owed > 0) return `You can't check: there's ${owed} to call`;
      return { type: "bet", to: seat.bet };
    case "call":
      if (owed === 0) return "There's nothing to call; you can check";
      return { type: "bet", to: allowed.call };
    case "raise":
      if (uiAction.to <= allowed.call) {
        return `A raise must be to more than ${allowed.call}`;
      }
      return { type: "bet", to: uiAction.to };
    case "allIn": {
      const everything = seat.bet + seat.stack;
      if (everything === allowed.call) return { type: "bet", to: everything };
      if (!allowed.raise) return allowed.noRaise ?? "You can't raise";
      return { type: "bet", to: allowed.raise.max };
    }
    default:
      return "Unknown action";
  }
};
