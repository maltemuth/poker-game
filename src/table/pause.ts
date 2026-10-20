/**
 * Pausing a table, interrupting it, and resuming it. While it's paused
 * (decision 0012), no new hands are dealt; a hand being played goes on to
 * the end. While it's interrupted, after a server restart (decision 0018),
 * nothing happens at all: no one acts, no hand starts, no timer runs.
 * Resuming ends an interruption first, and a pause after that. Only the
 * system pauses, interrupts and resumes; the plugin makes sure of that.
 */

import type { Table } from "./Table.js";

/** Why nothing may happen at an interrupted table */
export const INTERRUPTED = "The table is waiting for the host to resume it";

export const checkPause = (table: Table): true | string =>
  table.paused ? "The table is already paused" : true;

export const checkResume = (table: Table): true | string =>
  table.paused || table.interrupted ? true : "The table isn't paused";

/**
 * @throws {Error} If `checkPause` refuses
 */
export const pause = (table: Table): Table => {
  const accepted = checkPause(table);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  return { ...table, paused: true };
};

export const interrupt = (table: Table): Table => ({
  ...table,
  interrupted: true,
  // No timer runs at an interrupted table
  turnDeadline: null,
});

/**
 * @throws {Error} If `checkResume` refuses
 */
export const resume = (table: Table): Table => {
  const accepted = checkResume(table);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  return table.interrupted
    ? { ...table, interrupted: false }
    : { ...table, paused: false };
};
