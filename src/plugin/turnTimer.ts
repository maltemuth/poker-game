/**
 * The `turn` timer (decision 0014): whenever a new turn begins, it's
 * scheduled with the table's `turnTimeout`, for a timeout naming that turn;
 * scheduling the name again replaces the last turn's timer. When no one is
 * to act any more, it's cancelled. Actions that don't begin a new turn, such
 * as a fold out of turn or someone sitting down, leave it alone. With
 * `turnTimeout` null, there's never a timer. The table keeps when the turn
 * runs out, for clients' countdowns (decision 0019). Pausing the table
 * freezes the turn, which cancels the timer, and the table keeps the time
 * the turn had left; resuming schedules the timer with that time (decision 0023).
 */

import { handIsFrozen } from "../table/pause.js";
import { currentTurn } from "../table/timeOut.js";
import type { Table } from "../table/Table.js";
import type { TimerRequest } from "@malte.muth/remote-state";
import type { SystemAction } from "./HoldemAction.js";
import type { TimerChanges } from "./nextHandTimer.js";

export const TURN = "turn";

/**
 * The timer the table calls for as it stands; null if none
 *
 * @param timeLeft - The turn's time, if not the full `turnTimeout`
 */
export const turnRequest = (
  table: Table,
  timeLeft: number | null = null
): TimerRequest<SystemAction> | null => {
  const timeout = table.options.turnTimeout;
  const is = currentTurn(table);
  return timeout !== null && is
    ? {
        name: TURN,
        in: timeLeft ?? timeout,
        action: { type: "timeout", ...is },
      }
    : null;
};

/** The timer changes for a table going from `before` to `after`; empty if none */
export const turnTimer = (before: Table, after: Table): TimerChanges => {
  if (after.options.turnTimeout === null) return {};
  const was = currentTurn(before);
  const is = currentTurn(after);
  if (is && (!was || was.hand !== is.hand || was.turn !== is.turn)) {
    // Only a frozen turn has time left, and only resuming it starts it again
    return { schedule: [turnRequest(after, before.turnTimeLeft)!] };
  }
  if (was && !is) return { cancel: [TURN] };
  return {};
};

/**
 * The table's turn deadline after timer changes made at `now`: a new turn
 * timer sets it, cancelling the timer clears it, and anything else leaves it.
 */
export const turnDeadline = (
  table: Table,
  changes: TimerChanges,
  now: number
): number | null => {
  const turn = changes.schedule?.find((request) => request.name === TURN);
  if (turn) return now + turn.in;
  if (changes.cancel?.includes(TURN)) return null;
  return table.turnDeadline;
};

/**
 * The time the turn has left, kept while its hand is frozen, for a table
 * going from `before` to `after` at `now`: what was left of the deadline
 * when it's paused, and null once it's resumed.
 */
export const turnTimeLeft = (
  before: Table,
  after: Table,
  now: number
): number | null => {
  if (!handIsFrozen(after)) return null;
  if (handIsFrozen(before)) return before.turnTimeLeft;
  return before.turnDeadline === null
    ? null
    : Math.max(0, before.turnDeadline - now);
};
