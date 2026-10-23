/**
 * Pausing a table, interrupting it, and resuming it. While it's paused
 * (decision 0012), no new hands are dealt, and a hand being played is frozen
 * (decision 0023): no one bets, and nothing that would fold a hand is
 * allowed, until the host resumes the table. While it's interrupted, after a
 * server restart (decision 0018), nothing happens at all: no one acts, no
 * hand starts, no timer runs. Resuming ends an interruption first, and a
 * pause after that. Only the system pauses, interrupts and resumes; the
 * plugin makes sure of that.
 */

import { handIsRunning } from "./lookups.js";
import type { Table } from "./Table.js";

/** Why nothing may happen at an interrupted table */
export const INTERRUPTED = "The table is waiting for the host to resume it";

/** Why no one may change a frozen hand */
export const FROZEN = "The table is paused";

/** The table is paused with a hand being played, which waits for the host to resume it */
export const handIsFrozen = (table: Table): boolean =>
  table.paused && handIsRunning(table);

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
