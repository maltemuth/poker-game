/**
 * Accepts a player's action at the table, or says why not, by the rule for
 * its type. Actions come from clients, so an unknown or missing type is
 * rejected rather than trusted. At an interrupted table, no one may act
 * (decision 0018). While a paused table's hand is frozen (decision 0023), no
 * one may bet, and players dealt in may not leave or take a break, which
 * would fold their hand; anyone may still sit down or sit in.
 */

import { checkBet } from "./bet.js";
import { checkLeave } from "./leave.js";
import { handSeatOf } from "./lookups.js";
import { FROZEN, handIsFrozen, INTERRUPTED } from "./pause.js";
import { checkSitDown } from "./sitDown.js";
import { checkSitIn } from "./sitIn.js";
import { checkStandUp } from "./standUp.js";
import type { Table } from "./Table.js";
import type { TableAction } from "./TableAction.js";

export const checkTableAction = (
  table: Table,
  playerId: string,
  action: TableAction
): true | string => {
  if (table.interrupted) return INTERRUPTED;
  const frozen = handIsFrozen(table);
  const dealtIn = frozen && handSeatOf(table, playerId) !== null;
  switch (action?.type) {
    case "sitDown":
      return checkSitDown(table, playerId, action);
    case "standUp":
      return dealtIn ? FROZEN : checkStandUp(table, playerId);
    case "sitIn":
      return checkSitIn(table, playerId);
    case "leave":
      return dealtIn ? FROZEN : checkLeave(table, playerId);
    case "fold":
    case "check":
    case "call":
    case "raise":
    case "allIn":
      return frozen ? FROZEN : checkBet(table, playerId, action);
    default:
      return "Unknown action";
  }
};
