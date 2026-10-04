/**
 * A seated player leaves the table with their chips and becomes a spectator
 * (decision 0010). During a hand they were dealt into, their hand is folded
 * at once ([foldPlayer](foldPlayer.ts)), and they become a spectator when the
 * hand is over, since their seat is part of it until then.
 */

import type { Draw } from "../hand/Draw.js";
import { foldPlayer } from "./foldPlayer.js";
import { handSeatOf, seatOf } from "./lookups.js";
import { removeFromSeat } from "./removeFromSeat.js";
import type { Table } from "./Table.js";

export interface Leave {
  type: "leave";
}

export const checkLeave = (table: Table, playerId: string): true | string =>
  seatOf(table, playerId) === null ? "You don't have a seat" : true;

/**
 * @param draw - Deals the next cards if the fold ends a betting round
 * @throws {Error} If `checkLeave` rejects it
 */
export const leave = (table: Table, playerId: string, draw: Draw): Table => {
  const accepted = checkLeave(table, playerId);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  const index = seatOf(table, playerId) as number;
  if (handSeatOf(table, playerId) === null) return removeFromSeat(table, index);
  const leaving: Table = {
    ...table,
    seats: table.seats.map((seat, i) =>
      i === index && seat ? { ...seat, leaving: true } : seat
    ),
  };
  return foldPlayer(leaving, playerId, draw);
};
