/**
 * A player clicks a betting button at the table: it must be their turn in
 * the hand being played. The button is translated into the rules' action
 * (decision 0002) and played; when that ends the hand, the hand is settled
 * onto the table.
 */

import { applyHandAction } from "../hand/applyHandAction.js";
import { checkHandAction } from "../hand/checkHandAction.js";
import type { Draw } from "../hand/Draw.js";
import { translateUiAction } from "../ui/translateUiAction.js";
import type { UiAction } from "../ui/UiAction.js";
import { handIsRunning, handSeatOf } from "./lookups.js";
import { settleHand } from "./settleHand.js";
import type { Table } from "./Table.js";

export const checkBet = (
  table: Table,
  playerId: string,
  uiAction: UiAction
): true | string => {
  if (!handIsRunning(table) || !table.hand) return "No hand is being played";
  const index = handSeatOf(table, playerId);
  if (index === null) return "You aren't in this hand";
  if (table.hand.betting.toAct !== index) return "It's not your turn";
  const action = translateUiAction(table.hand.betting, uiAction);
  if (typeof action === "string") return action;
  return checkHandAction(table.hand, action);
};

/**
 * @throws {Error} If `checkBet` rejects it
 */
export const bet = (
  table: Table,
  playerId: string,
  uiAction: UiAction,
  draw: Draw
): Table => {
  const accepted = checkBet(table, playerId, uiAction);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  const hand = table.hand!;
  const action = translateUiAction(hand.betting, uiAction);
  if (typeof action === "string") throw new Error(action);
  const played = { ...table, hand: applyHandAction(hand, action, draw) };
  return played.hand.result ? settleHand(played) : played;
};
