/**
 * A spectator takes a free seat with a buy-in within the table's range. If a
 * game is running, with at least two players in it, they're a new player,
 * dealt in by the table's `newPlayers` rule (decision 0006); otherwise
 * they're dealt in from the next hand.
 */

import { isSpectator, playingSeats, seatOf } from "./lookups.js";
import type { Table } from "./Table.js";

export interface SitDown {
  type: "sitDown";
  /** The seat number, from 1 */
  seat: number;
  buyIn: number;
}

export const checkSitDown = (
  table: Table,
  playerId: string,
  { seat, buyIn }: SitDown
): true | string => {
  if (seatOf(table, playerId) !== null) return "You already have a seat";
  if (!isSpectator(table, playerId))
    return "Only people at the table can sit down";
  if (!Number.isInteger(seat) || seat < 1 || seat > table.seats.length) {
    return `There's no seat ${seat}`;
  }
  if (table.seats[seat - 1]) return `Seat ${seat} is taken`;
  const { min, max } = table.options.buyIn;
  if (!Number.isInteger(buyIn) || buyIn < min || buyIn > max) {
    return `The buy-in must be a whole number of chips from ${min} to ${max}`;
  }
  return true;
};

/**
 * @throws {Error} If `checkSitDown` rejects it
 */
export const sitDown = (
  table: Table,
  playerId: string,
  action: SitDown
): Table => {
  const accepted = checkSitDown(table, playerId, action);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  const person = table.spectators.find((p) => p.playerId === playerId)!;
  const newPlayer =
    table.options.newPlayers !== "nextHand" && playingSeats(table).length >= 2;
  return {
    ...table,
    spectators: table.spectators.filter((p) => p.playerId !== playerId),
    seats: table.seats.map((seat, index) =>
      index === action.seat - 1
        ? {
            ...person,
            stack: action.buyIn,
            sittingOut: false,
            newPlayer,
            leaving: false,
          }
        : seat
    ),
  };
};
