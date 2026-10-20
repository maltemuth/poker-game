/**
 * The package's entry point: everything a host or a client imports from
 * poker-game. Rules are exported here as they're added: so far the betting,
 * the pots, the hand, the table, the buttons players click, and the views.
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
export { blindPositions, postBlinds } from "./betting/postBlinds.js";
export { canAct, isAllIn, isInHand } from "./betting/seatStatus.js";

export type { Card } from "./hand/cards.js";
export type { Draw } from "./hand/Draw.js";
export type {
  BettingRoundName,
  Hand,
  HandResult,
  ShownHand,
} from "./hand/Hand.js";
export type { RankedHand } from "./hand/rankHand.js";
export { allCards, cardsOut, isCard } from "./hand/cards.js";
export { applyHandAction } from "./hand/applyHandAction.js";
export { checkHandAction } from "./hand/checkHandAction.js";
export { continueHand } from "./hand/continueHand.js";
export { drawCards } from "./hand/Draw.js";
export { endHand } from "./hand/endHand.js";
export { fixedDraw } from "./hand/fixedDraw.js";
export { randomDraw } from "./hand/randomDraw.js";
export { rankHand } from "./hand/rankHand.js";
export { startHand } from "./hand/startHand.js";

export type { Pot } from "./pots/Pot.js";
export type { Award, Ranks } from "./pots/splitPot.js";
export type { AwardedHand } from "./pots/awardPots.js";
export { awardPots } from "./pots/awardPots.js";
export { collectBets } from "./pots/collectBets.js";
export { clockwiseFromButton, oddChipOrder } from "./pots/oddChips.js";
export { pots } from "./pots/pots.js";
export { splitPot } from "./pots/splitPot.js";
export { returnUncalledBet } from "./pots/uncalledBet.js";

export type { Person, SeatedPlayer, Table } from "./table/Table.js";
export type { TableAction } from "./table/TableAction.js";
export type { NewPlayerRule, TableOptions } from "./table/TableOptions.js";
export type { TableOptionsInput } from "./table/newTable.js";
export type { OptionChanges, SetOptions } from "./table/setOptions.js";
export type { Deal } from "./table/playersToDeal.js";
export { addSpectator } from "./table/addSpectator.js";
export { applyTableAction } from "./table/applyTableAction.js";
export { checkTableAction } from "./table/checkTableAction.js";
export {
  handIsRunning,
  handSeatOf,
  isSpectator,
  playingSeats,
  seatOf,
} from "./table/lookups.js";
export { newTable } from "./table/newTable.js";
export { optionProblems } from "./table/optionProblems.js";
export { newPlayerRules } from "./table/TableOptions.js";
export { playersToDeal } from "./table/playersToDeal.js";
export { settleHand } from "./table/settleHand.js";
export { checkStartHand, startNextHand } from "./table/startNextHand.js";

export type { UiAction } from "./ui/UiAction.js";
export type { UiOption } from "./ui/availableUiActions.js";
export { availableUiActions } from "./ui/availableUiActions.js";
export { translateUiAction } from "./ui/translateUiAction.js";

export type {
  HandPlayerView,
  HandView,
  SeatView,
  TableView,
  ViewerView,
} from "./views/TableView.js";
export { audienceOf, SPECTATORS } from "./views/audiences.js";
export { viewHand } from "./views/viewHand.js";
export { viewTable } from "./views/viewTable.js";
