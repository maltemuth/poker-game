/**
 * Every action the Hold'em game takes in Remote State: what players send at
 * the table, and what only the system sends, through the host's `act` or,
 * later, timers (decision 0012).
 */

import type { TableAction } from "../table/TableAction.js";

export type SystemAction =
  { type: "startHand" } | { type: "pause" } | { type: "resume" };

export type HoldemAction = TableAction | SystemAction;

const systemActionTypes = ["startHand", "pause", "resume"];

/** Whether the action is one only the system may send */
export const isSystemAction = (action: unknown): action is SystemAction =>
  typeof action === "object" &&
  action !== null &&
  systemActionTypes.includes((action as { type?: unknown }).type as string);
