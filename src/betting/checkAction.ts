/**
 * Accepts a betting action from the player to act, or says why not. A fold
 * is always accepted. A bet is accepted if its total is the call or within
 * the raise range ([allowedBets](allowedBets.ts)). The reasons are addressed
 * to the player, since the plugin passes them on.
 *
 * The action comes from outside, so its shape is checked too.
 */

import type { BettingAction } from "./BettingAction.js";
import type { BettingRound } from "./BettingRound.js";
import { allowedBets } from "./allowedBets.js";

/** `true` if the player to act may take `action`, otherwise the reason */
export const checkAction = (
  round: BettingRound,
  action: BettingAction
): true | string => {
  const allowed = allowedBets(round);
  if (!allowed) return "The betting round is over";
  if (action?.type === "fold") return true;
  if (action?.type !== "bet") return "Unknown action";

  const { to } = action;
  if (!Number.isInteger(to)) return "A bet must be a whole number of chips";
  if (to === allowed.call) return true;
  if (to < allowed.call) {
    return `You must bet at least ${allowed.call} to stay in`;
  }
  if (!allowed.raise) return allowed.noRaise ?? "You can't raise";
  if (to < allowed.raise.min) {
    return `A raise must be to at least ${allowed.raise.min}`;
  }
  if (to > allowed.raise.max) return `You only have ${allowed.raise.max}`;
  return true;
};
