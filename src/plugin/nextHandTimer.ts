/**
 * The `nextHand` timer (decision 0013): scheduled when an action makes a
 * hand startable, such as the end of a hand or the second player sitting
 * down, and cancelled when one stops being startable, such as when a hand
 * starts or the table is paused. Actions that change neither leave a
 * pending timer alone. With the table's `nextHandDelay` null, there's never
 * a timer. When the host changes the options (decision 0020), the timer
 * starts over with the new delay, or is cancelled if there's none.
 */

import type { TimerRequest } from "@malte.muth/remote-state";
import { checkStartHand } from "../table/startNextHand.js";
import type { Table } from "../table/Table.js";
import type { SystemAction } from "./HoldemAction.js";

export const NEXT_HAND = "nextHand";

export interface TimerChanges {
  schedule?: TimerRequest<SystemAction>[];
  cancel?: string[];
}

const startable = (table: Table) => checkStartHand(table) === true;

/** The timer the table calls for as it stands, with its full time; null if none */
export const nextHandRequest = (
  table: Table
): TimerRequest<SystemAction> | null => {
  const delay = table.options.nextHandDelay;
  return delay !== null && startable(table)
    ? { name: NEXT_HAND, in: delay, action: { type: "startHand" } }
    : null;
};

/**
 * The timer changes for a table going from `before` to `after`; empty if none
 *
 * @param dealt - The action dealt a hand. If the blinds played it out at once,
 *   the table is startable before and after, but needs a new timer.
 */
export const nextHandTimer = (
  before: Table,
  after: Table,
  dealt: boolean
): TimerChanges => {
  if (after.options.nextHandDelay === null) return {};
  const was = startable(before);
  const is = startable(after);
  if (is && (!was || dealt)) return { schedule: [nextHandRequest(after)!] };
  if (was && !is) return { cancel: [NEXT_HAND] };
  return {};
};

/** The timer changes for a table whose options just changed */
export const nextHandTimerForNewOptions = (after: Table): TimerChanges => {
  const request = nextHandRequest(after);
  return request ? { schedule: [request] } : { cancel: [NEXT_HAND] };
};
