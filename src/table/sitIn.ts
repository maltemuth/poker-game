/**
 * A player who sits out sits in again: they're dealt in from the next hand,
 * without posting anything.
 */

import { seatOf } from "./lookups.js";
import type { Table } from "./Table.js";

export interface SitIn {
  type: "sitIn";
}

export const checkSitIn = (table: Table, playerId: string): true | string => {
  const index = seatOf(table, playerId);
  if (index === null) return "You don't have a seat";
  return table.seats[index]?.sittingOut ? true : "You aren't sitting out";
};

/**
 * @throws {Error} If `checkSitIn` rejects it
 */
export const sitIn = (table: Table, playerId: string): Table => {
  const accepted = checkSitIn(table, playerId);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  return {
    ...table,
    seats: table.seats.map((seat) =>
      seat?.playerId === playerId ? { ...seat, sittingOut: false } : seat
    ),
  };
};
