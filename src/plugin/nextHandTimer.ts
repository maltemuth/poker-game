/**
 * The `nextHand` timer (decision 0013): scheduled when an action makes a
 * hand startable, such as the end of a hand or the second player sitting
 * down, and cancelled when one stops being startable, such as when a hand
 * starts or the table is paused. Actions that change neither leave a
 * pending timer alone. With the table's `nextHandDelay` null, there's never
 * a timer.
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
  const delay = after.options.nextHandDelay;
  if (delay === null) return {};
  const was = startable(before);
  const is = startable(after);
  if (is && (!was || dealt)) {
    return {
      schedule: [{ name: NEXT_HAND, in: delay, action: { type: "startHand" } }],
    };
  }
  if (was && !is) return { cancel: [NEXT_HAND] };
  return {};
};
