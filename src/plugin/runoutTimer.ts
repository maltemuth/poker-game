/**
 * The `runout` timer (decision 0015): while a hand waits for the next cards
 * of a paced all-in runout, it's scheduled with the table's `runoutDelay`,
 * for a step naming the hand and the board so far. Each step that leaves the
 * hand waiting schedules the next; when the hand stops waiting, such as when
 * it ends, the timer is cancelled.
 */

import { currentRunout } from "../table/runout.js";
import type { Table } from "../table/Table.js";
import type { TimerRequest } from "@malte.muth/remote-state";
import type { SystemAction } from "./HoldemAction.js";
import type { TimerChanges } from "./nextHandTimer.js";

export const RUNOUT = "runout";

/** The timer the table calls for as it stands, with its full time; null if none */
export const runoutRequest = (
  table: Table
): TimerRequest<SystemAction> | null => {
  const delay = table.options.runoutDelay;
  const is = currentRunout(table);
  return delay !== null && is
    ? { name: RUNOUT, in: delay, action: { type: "runout", ...is } }
    : null;
};

/** The timer changes for a table going from `before` to `after`; empty if none */
export const runoutTimer = (before: Table, after: Table): TimerChanges => {
  if (after.options.runoutDelay === null) return {};
  const was = currentRunout(before);
  const is = currentRunout(after);
  if (is && (!was || was.hand !== is.hand || was.board !== is.board)) {
    return { schedule: [runoutRequest(after)!] };
  }
  if (was && !is) return { cancel: [RUNOUT] };
  return {};
};
