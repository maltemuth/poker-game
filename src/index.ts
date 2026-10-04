/**
 * The package's entry point: everything a host or a client imports from
 * poker-game. Rules are exported here as they're added: so far the betting,
 * the pots, and the buttons players click.
 */

export type { BettingAction } from "./betting/BettingAction.js";
export type { BettingRound, BettingSeat } from "./betting/BettingRound.js";
export type { AllowedBets, RaiseRange } from "./betting/allowedBets.js";
export type { Blinds, DealtSeat } from "./betting/postBlinds.js";
export { allowedBets } from "./betting/allowedBets.js";
export { applyAction } from "./betting/applyAction.js";
export { betToMatch } from "./betting/betToMatch.js";
export { checkAction } from "./betting/checkAction.js";
export { nextBettingRound } from "./betting/nextBettingRound.js";
export { nextToAct } from "./betting/nextToAct.js";
export { postBlinds } from "./betting/postBlinds.js";
export { canAct, isAllIn, isInHand } from "./betting/seatStatus.js";

export type { Pot } from "./pots/Pot.js";
export type { Award, Ranks } from "./pots/splitPot.js";
export type { AwardedHand } from "./pots/awardPots.js";
export { awardPots } from "./pots/awardPots.js";
export { collectBets } from "./pots/collectBets.js";
export { clockwiseFromButton, oddChipOrder } from "./pots/oddChips.js";
export { pots } from "./pots/pots.js";
export { splitPot } from "./pots/splitPot.js";
export { returnUncalledBet } from "./pots/uncalledBet.js";

export type { UiAction } from "./ui/UiAction.js";
export type { UiOption } from "./ui/availableUiActions.js";
export { availableUiActions } from "./ui/availableUiActions.js";
export { translateUiAction } from "./ui/translateUiAction.js";
