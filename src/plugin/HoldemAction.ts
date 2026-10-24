/**
 * Every action the Hold'em game takes in Remote State: what players send at
 * the table, and what only the system sends, through the host's `dispatch` or
 * the timers (decisions 0012 to 0015, and 0020 for changing the options).
 */

import type { TableAction } from "../table/TableAction.js";
import type { RunoutStep } from "../table/runout.js";
import type { SetOptions } from "../table/setOptions.js";
import type { Turn } from "../table/timeOut.js";

export type SystemAction =
  | { type: "startHand" }
  | { type: "pause" }
  | { type: "resume" }
  /** Change the options before the first hand (decision 0020) */
  | SetOptions
  /** A turn ran out (decision 0014): sent by the `turn` timer */
  | ({ type: "timeout" } & Turn)
  /** The next cards of an all-in runout (decision 0015): sent by the `runout` timer */
  | ({ type: "runout" } & RunoutStep);

export type HoldemAction = TableAction | SystemAction;

const systemActionTypes = [
  "startHand",
  "pause",
  "resume",
  "setOptions",
  "timeout",
  "runout",
];

/** Whether the action is one only the system may send */
export const isSystemAction = (action: unknown): action is SystemAction =>
  typeof action === "object" &&
  action !== null &&
  systemActionTypes.includes((action as { type?: unknown }).type as string);
