/**
 * The next step of a paced all-in runout at the table (decision 0015): the
 * next betting round's cards are dealt, and after the river, the hand is
 * settled. A step names the hand and how many board cards it follows, so
 * one that's out of date is refused. No cards come while the hand is frozen
 * (decision 0023).
 */

import type { Draw } from "../hand/Draw.js";
import { dealRunout, waitsForRunout } from "../hand/dealRunout.js";
import { handIsRunning } from "./lookups.js";
import { FROZEN, handIsFrozen, INTERRUPTED } from "./pause.js";
import { settleHand } from "./settleHand.js";
import type { Table } from "./Table.js";

/** Which runout step: the table's hand number, and the board cards dealt so far */
export interface RunoutStep {
  hand: number;
  board: number;
}

/** The runout step the table waits for, or null if it waits for none, as while the hand is frozen */
export const currentRunout = (table: Table): RunoutStep | null =>
  handIsRunning(table) &&
  !handIsFrozen(table) &&
  table.hand &&
  waitsForRunout(table.hand)
    ? { hand: table.handNumber, board: table.hand.board.length }
    : null;

export const checkRunout = (table: Table, step: RunoutStep): true | string => {
  if (table.interrupted) return INTERRUPTED;
  if (handIsFrozen(table)) return FROZEN;
  const current = currentRunout(table);
  return current && current.hand === step.hand && current.board === step.board
    ? true
    : "That runout step is over";
};

/**
 * @throws {Error} If `checkRunout` refuses
 */
export const runout = (table: Table, step: RunoutStep, draw: Draw): Table => {
  const accepted = checkRunout(table, step);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  const dealt = { ...table, hand: dealRunout(table.hand!, draw) };
  return dealt.hand.result ? settleHand(dealt) : dealt;
};
