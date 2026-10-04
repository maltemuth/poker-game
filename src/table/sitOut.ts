/**
 * A seated player sits out: they keep their seat and chips but aren't dealt
 * in, from the next hand on, until they sit in again. A hand they're playing
 * goes on as usual.
 */

import { seatOf } from "./lookups.js";
import type { Table } from "./Table.js";

export interface SitOut {
  type: "sitOut";
}

export const checkSitOut = (table: Table, playerId: string): true | string => {
  const index = seatOf(table, playerId);
  if (index === null) return "You don't have a seat";
  return table.seats[index]?.sittingOut ? "You're already sitting out" : true;
};

/**
 * @throws {Error} If `checkSitOut` rejects it
 */
export const sitOut = (table: Table, playerId: string): Table => {
  const accepted = checkSitOut(table, playerId);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  return {
    ...table,
    seats: table.seats.map((seat) =>
      seat?.playerId === playerId ? { ...seat, sittingOut: true } : seat
    ),
  };
};
