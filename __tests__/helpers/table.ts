/**
 * Builds tables for tests: blinds of 50/100, buy-ins from 1,000 to 5,000,
 * six seats, and players named after their IDs.
 */

import { newTable } from "../../src/table/newTable.js";
import type { SeatedPlayer, Table } from "../../src/table/Table.js";
import type { NewPlayerRule } from "../../src/table/TableOptions.js";

export const options = {
  blinds: { small: 50, big: 100 },
  buyIn: { min: 1000, max: 5000 },
  seats: 6,
};

export const emptyTable = (newPlayers: NewPlayerRule = "nextHand"): Table =>
  newTable({ ...options, newPlayers });

export const seated = (
  playerId: string,
  fields: Partial<SeatedPlayer> = {}
): SeatedPlayer => ({
  playerId,
  name: playerId,
  stack: 1000,
  sittingOut: false,
  newPlayer: false,
  leaving: false,
  ...fields,
});

/** A table with players in the given seats, by index; null for an empty seat */
export const tableWith = (
  seats: (SeatedPlayer | null)[],
  fields: Partial<Table> = {}
): Table => {
  const table = emptyTable(fields.options?.newPlayers);
  return {
    ...table,
    seats: table.seats.map((_, index) => seats[index] ?? null),
    ...fields,
  };
};
