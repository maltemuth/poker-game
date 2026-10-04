/**
 * Questions about who is where at a table: a player's seat, who plays, whether
 * a hand is being played, and whether a player is in it. The rules for
 * seating, dealing and betting ask these.
 */

import type { Table } from "./Table.js";

/** Index into the seats of the player's seat, or null if they have none */
export const seatOf = (table: Table, playerId: string): number | null => {
  const index = table.seats.findIndex((seat) => seat?.playerId === playerId);
  return index === -1 ? null : index;
};

/**
 * Indices of the seats whose players are in the game: seated, not sitting
 * out, and not new players still waiting to be dealt in (decision 0006)
 */
export const playingSeats = (table: Table): number[] =>
  table.seats.flatMap((seat, index) =>
    seat && !seat.sittingOut && !seat.newPlayer ? [index] : []
  );

export const isSpectator = (table: Table, playerId: string): boolean =>
  table.spectators.some((person) => person.playerId === playerId);

/** A hand is dealt and not over yet */
export const handIsRunning = (table: Table): boolean =>
  table.hand !== null && table.hand.result === null;

/**
 * Index into the running hand's betting seats of the player, or null if no
 * hand is running or they weren't dealt in
 */
export const handSeatOf = (table: Table, playerId: string): number | null => {
  const seat = seatOf(table, playerId);
  if (seat === null || !handIsRunning(table) || !table.hand) return null;
  const index = table.hand.betting.seats.findIndex(
    (bettingSeat) => bettingSeat.seat === seat + 1
  );
  return index === -1 ? null : index;
};
