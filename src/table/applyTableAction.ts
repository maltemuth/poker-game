/**
 * The table after a player's action, by the rule for its type. `draw` deals
 * the board cards that betting, or standing up, which folds, may bring.
 */

import type { Draw } from "../hand/Draw.js";
import { bet } from "./bet.js";
import { checkTableAction } from "./checkTableAction.js";
import { sitDown } from "./sitDown.js";
import { sitIn } from "./sitIn.js";
import { sitOut } from "./sitOut.js";
import { standUp } from "./standUp.js";
import type { Table } from "./Table.js";
import type { TableAction } from "./TableAction.js";

/**
 * @throws {Error} If `checkTableAction` rejects it
 */
export const applyTableAction = (
  table: Table,
  playerId: string,
  action: TableAction,
  draw: Draw
): Table => {
  const accepted = checkTableAction(table, playerId, action);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  switch (action.type) {
    case "sitDown":
      return sitDown(table, playerId, action);
    case "standUp":
      return standUp(table, playerId, draw);
    case "sitOut":
      return sitOut(table, playerId);
    case "sitIn":
      return sitIn(table, playerId);
    default:
      return bet(table, playerId, action, draw);
  }
};
