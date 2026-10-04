/**
 * Every action the Hold'em game takes in Remote State: what players send at
 * the table, and what only the system sends, through the host's `act` or
 * the timers (decisions 0012, 0013, 0014).
 */

import type { TableAction } from "../table/TableAction.js";
import type { Turn } from "../table/timeOut.js";

export type SystemAction =
  | { type: "startHand" }
  | { type: "pause" }
  | { type: "resume" }
  /** A turn ran out (decision 0014): sent by the `turn` timer */
  | ({ type: "timeout" } & Turn);

export type HoldemAction = TableAction | SystemAction;

const systemActionTypes = ["startHand", "pause", "resume", "timeout"];

/** Whether the action is one only the system may send */
export const isSystemAction = (action: unknown): action is SystemAction =>
  typeof action === "object" &&
  action !== null &&
  systemActionTypes.includes((action as { type?: unknown }).type as string);
