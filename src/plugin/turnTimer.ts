/**
 * The `turn` timer (decision 0014): whenever a new turn begins, it's
 * scheduled with the table's `turnTimeout`, for a timeout naming that turn;
 * scheduling the name again replaces the last turn's timer. When no one is
 * to act any more, it's cancelled. Actions that don't begin a new turn, such
 * as a fold out of turn or someone sitting down, leave it alone. With
 * `turnTimeout` null, there's never a timer.
 */

import { currentTurn } from "../table/timeOut.js";
import type { Table } from "../table/Table.js";
import type { TimerRequest } from "@malte.muth/remote-state";
import type { SystemAction } from "./HoldemAction.js";
import type { TimerChanges } from "./nextHandTimer.js";

export const TURN = "turn";

/** The timer the table calls for as it stands, with its full time; null if none */
export const turnRequest = (
  table: Table
): TimerRequest<SystemAction> | null => {
  const timeout = table.options.turnTimeout;
  const is = currentTurn(table);
  return timeout !== null && is
    ? { name: TURN, in: timeout, action: { type: "timeout", ...is } }
    : null;
};

/** The timer changes for a table going from `before` to `after`; empty if none */
export const turnTimer = (before: Table, after: Table): TimerChanges => {
  if (after.options.turnTimeout === null) return {};
  const was = currentTurn(before);
  const is = currentTurn(after);
  if (is && (!was || was.hand !== is.hand || was.turn !== is.turn)) {
    return { schedule: [turnRequest(after)!] };
  }
  if (was && !is) return { cancel: [TURN] };
  return {};
};
