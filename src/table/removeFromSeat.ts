/**
 * Takes a player off their seat and into the spectators. Their chips leave
 * with them; callers make sure the seat's stack is final, so no hand still
 * holds chips of that seat.
 */

import type { Table } from "./Table.js";

/** The table without the player at seat index `index`, who now watches */
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
