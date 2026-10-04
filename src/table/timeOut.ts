/**
 * A turn runs out (decision 0014): the player to act folds, even if they
 * could check, and the hand moves on as after any fold. The timeout names
 * the hand and turn it's for, so one for a turn that's over is refused.
 */

import { foldInHand } from "../hand/foldInHand.js";
import type { Draw } from "../hand/Draw.js";
import { handIsRunning } from "./lookups.js";
import { settleHand } from "./settleHand.js";
import type { Table } from "./Table.js";

/** Which turn a timeout is for: the table's hand number and the hand's turn */
export interface Turn {
  hand: number;
  turn: number;
}

/** The turn being played, or null if no one is to act */
export const currentTurn = (table: Table): Turn | null =>
  handIsRunning(table) && table.hand && table.hand.betting.toAct !== null
    ? { hand: table.handNumber, turn: table.hand.turn }
    : null;

export const checkTimeOut = (table: Table, turn: Turn): true | string => {
  const current = currentTurn(table);
  return current && current.hand === turn.hand && current.turn === turn.turn
    ? true
    : "That turn is over";
};

/**
 * @throws {Error} If `checkTimeOut` refuses
 */
export const timeOut = (table: Table, turn: Turn, draw: Draw): Table => {
  const accepted = checkTimeOut(table, turn);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  const hand = table.hand!;
  const folded = {
    ...table,
    hand: foldInHand(hand, hand.betting.toAct!, draw),
  };
  return folded.hand.result ? settleHand(folded) : folded;
};
