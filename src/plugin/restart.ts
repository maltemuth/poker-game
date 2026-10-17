/**
 * A table across a server restart (decision 0018). Remote State loses pending
 * timers when the server stops, so on starting again it offers every table to
 * the plugin: a table that would have had a timer running is interrupted, and
 * nothing happens at it until the host resumes it, once everyone is back.
 * Resuming schedules again every timer the table calls for, with its full
 * time; a table with no timer to lose is left as it was.
 */

import type { TimerRequest } from "@malte.muth/remote-state";
import { interrupt } from "../table/pause.js";
import type { Table } from "../table/Table.js";
import type { SystemAction } from "./HoldemAction.js";
import { nextHandRequest } from "./nextHandTimer.js";
import { runoutRequest } from "./runoutTimer.js";
import { turnRequest } from "./turnTimer.js";

/** Every timer the table calls for as it stands, each with its full time */
export const timersFor = (table: Table): TimerRequest<SystemAction>[] =>
  [nextHandRequest(table), turnRequest(table), runoutRequest(table)].filter(
    (request) => request !== null
  );

/** The table as the server finds it after a restart: the same object if nothing changes */
export const onRestart = (table: Table): Table =>
  table.interrupted || timersFor(table).length === 0 ? table : interrupt(table);
