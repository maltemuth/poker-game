/**
 * The `runout` timer (decision 0015): while a hand waits for the next cards
 * of a paced all-in runout, it's scheduled with the table's `runoutDelay`,
 * for a step naming the hand and the board so far. Each step that leaves the
 * hand waiting schedules the next; when the hand stops waiting, such as when
 * it ends, the timer is cancelled.
 */

import { currentRunout } from "../table/runout.js";
import type { Table } from "../table/Table.js";
import type { TimerChanges } from "./nextHandTimer.js";

export const RUNOUT = "runout";

/** The timer changes for a table going from `before` to `after`; empty if none */
export const runoutTimer = (before: Table, after: Table): TimerChanges => {
  const delay = after.options.runoutDelay;
  if (delay === null) return {};
  const was = currentRunout(before);
  const is = currentRunout(after);
  if (is && (!was || was.hand !== is.hand || was.board !== is.board)) {
    return {
      schedule: [
        { name: RUNOUT, in: delay, action: { type: "runout", ...is } },
      ],
    };
  }
  if (was && !is) return { cancel: [RUNOUT] };
  return {};
};
