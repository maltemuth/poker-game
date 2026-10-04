/**
 * Who sees what (Texas Hold'em design, Audiences): every seated player has
 * their own view, by their player ID, and everyone else, spectators and
 * players who left, shares the view of `spectators`. People change audience
 * only when they sit down or leave, not when they fold or take a break.
 */

import { seatOf } from "../table/lookups.js";
import type { Table } from "../table/Table.js";

export const SPECTATORS = "spectators";

/** The audience whose view the person gets: their player ID if seated, otherwise `spectators` */
export const audienceOf = (table: Table, playerId: string): string =>
  seatOf(table, playerId) === null ? SPECTATORS : playerId;
