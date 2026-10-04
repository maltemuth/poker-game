/**
 * Someone arrives at the table: everyone starts as a spectator, and sits
 * down from there. Someone already at the table, seated or watching, stays
 * where they are.
 */

import { isSpectator, seatOf } from "./lookups.js";
import type { Person, Table } from "./Table.js";

export const addSpectator = (table: Table, person: Person): Table =>
  isSpectator(table, person.playerId) || seatOf(table, person.playerId) !== null
    ? table
    : { ...table, spectators: [...table.spectators, person] };
