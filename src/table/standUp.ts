/**
 * A seated player takes a break (decision 0010): they keep their seat and
 * chips, and aren't dealt in until they sit in again. During a hand they're
 * playing, their hand is folded at once ([foldPlayer](foldPlayer.ts)).
 */

import type { Draw } from "../hand/Draw.js";
import { foldPlayer } from "./foldPlayer.js";
import { seatOf } from "./lookups.js";
import type { Table } from "./Table.js";

export interface StandUp {
  type: "standUp";
}

export const checkStandUp = (table: Table, playerId: string): true | string => {
  const index = seatOf(table, playerId);
  if (index === null) return "You don't have a seat";
  return table.seats[index]?.sittingOut ? "You're already on a break" : true;
};

/**
 * @param draw - Deals the next cards if the fold ends a betting round
 * @throws {Error} If `checkStandUp` rejects it
 */
export const standUp = (table: Table, playerId: string, draw: Draw): Table => {
  const accepted = checkStandUp(table, playerId);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  const onBreak: Table = {
    ...table,
    seats: table.seats.map((seat) =>
      seat?.playerId === playerId ? { ...seat, sittingOut: true } : seat
    ),
  };
  return foldPlayer(onBreak, playerId, draw);
};
