/**
 * A seated player gives up their seat and becomes a spectator, taking their
 * chips with them. If they were dealt into the hand that's being played,
 * even if they folded, they stand up when it's over, since their chips are
 * in the hand until then.
 */

import { handSeatOf, seatOf } from "./lookups.js";
import type { Table } from "./Table.js";

export interface StandUp {
  type: "standUp";
}

export const checkStandUp = (table: Table, playerId: string): true | string =>
  seatOf(table, playerId) === null ? "You don't have a seat" : true;

/** Takes the player at seat index `index` off the table, into the spectators */
export const removeFromSeat = (table: Table, index: number): Table => {
  const player = table.seats[index];
  if (!player) return table;
  return {
    ...table,
    spectators: [
      ...table.spectators,
      { playerId: player.playerId, name: player.name },
    ],
    seats: table.seats.map((seat, i) => (i === index ? null : seat)),
  };
};

/**
 * @throws {Error} If `checkStandUp` rejects it
 */
export const standUp = (table: Table, playerId: string): Table => {
  const accepted = checkStandUp(table, playerId);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  const index = seatOf(table, playerId) as number;
  if (handSeatOf(table, playerId) === null) return removeFromSeat(table, index);
  return {
    ...table,
    seats: table.seats.map((seat, i) =>
      i === index && seat ? { ...seat, leaving: true } : seat
    ),
  };
};
