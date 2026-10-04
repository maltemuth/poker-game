/**
 * Pausing a table, and resuming it (decision 0012): while it's paused, no new
 * hands are dealt; a hand being played goes on to the end. Only the system
 * pauses and resumes; the plugin makes sure of that.
 */

import type { Table } from "./Table.js";

export const checkPause = (table: Table): true | string =>
  table.paused ? "The table is already paused" : true;

export const checkResume = (table: Table): true | string =>
  table.paused ? true : "The table isn't paused";

/**
 * @throws {Error} If `checkPause` refuses
 */
export const pause = (table: Table): Table => {
  const accepted = checkPause(table);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  return { ...table, paused: true };
};

/**
 * @throws {Error} If `checkResume` refuses
 */
export const resume = (table: Table): Table => {
  const accepted = checkResume(table);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  return { ...table, paused: false };
};
