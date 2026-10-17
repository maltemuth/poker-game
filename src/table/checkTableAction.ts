/**
 * Accepts a player's action at the table, or says why not, by the rule for
 * its type. Actions come from clients, so an unknown or missing type is
 * rejected rather than trusted. At an interrupted table, no one may act
 * (decision 0018).
 */

import { checkBet } from "./bet.js";
import { checkLeave } from "./leave.js";
import { INTERRUPTED } from "./pause.js";
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
  switch (action?.type) {
    case "sitDown":
      return checkSitDown(table, playerId, action);
    case "standUp":
      return checkStandUp(table, playerId);
    case "sitIn":
      return checkSitIn(table, playerId);
    case "leave":
      return checkLeave(table, playerId);
    case "fold":
    case "check":
    case "call":
    case "raise":
    case "allIn":
      return checkBet(table, playerId, action);
    default:
      return "Unknown action";
  }
};
