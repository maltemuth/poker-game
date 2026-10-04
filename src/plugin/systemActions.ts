/**
 * The system's actions at a table (decision 0012): starting the next hand,
 * pausing and resuming, and a turn running out (decision 0014). They're checked like players' actions, so a stale
 * or repeated one is rejected with a reason.
 */

import type { Draw } from "../hand/Draw.js";
import { checkPause, checkResume, pause, resume } from "../table/pause.js";
import { checkStartHand, startNextHand } from "../table/startNextHand.js";
import type { Table } from "../table/Table.js";
import { checkTimeOut, timeOut } from "../table/timeOut.js";
import type { SystemAction } from "./HoldemAction.js";

export const checkSystemAction = (
  table: Table,
  action: SystemAction
): true | string => {
  switch (action.type) {
    case "startHand":
      return checkStartHand(table);
    case "pause":
      return checkPause(table);
    case "resume":
      return checkResume(table);
    case "timeout":
      return checkTimeOut(table, action);
  }
};

/**
 * @throws {Error} If `checkSystemAction` rejects it
 */
export const applySystemAction = (
  table: Table,
  action: SystemAction,
  draw: Draw
): Table => {
  switch (action.type) {
    case "startHand":
      return startNextHand(table, draw);
    case "pause":
      return pause(table);
    case "resume":
      return resume(table);
    case "timeout":
      return timeOut(table, action, draw);
  }
};
