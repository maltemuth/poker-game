/**
 * A seated player gives up their seat and becomes a spectator, taking their
 * chips with them. During a hand they were dealt into, standing up folds
 * their hand at once, in turn or not (decision 0009); they become a
 * spectator when the hand is over, since their seat is part of it until
 * then. If the fold ends the hand, it's settled right away.
 */

import { isInHand } from "../betting/seatStatus.js";
import type { Draw } from "../hand/Draw.js";
import { foldInHand } from "../hand/foldInHand.js";
import { handSeatOf, seatOf } from "./lookups.js";
import { removeFromSeat } from "./removeFromSeat.js";
import { settleHand } from "./settleHand.js";
import type { Table } from "./Table.js";

export interface StandUp {
  type: "standUp";
}

export const checkStandUp = (table: Table, playerId: string): true | string =>
  seatOf(table, playerId) === null ? "You don't have a seat" : true;

/**
 * @param draw - Deals the next cards if the fold ends a betting round
 * @throws {Error} If `checkStandUp` rejects it
 */
export const standUp = (table: Table, playerId: string, draw: Draw): Table => {
  const accepted = checkStandUp(table, playerId);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  const index = seatOf(table, playerId) as number;
  const inHand = handSeatOf(table, playerId);
  if (inHand === null || !table.hand) return removeFromSeat(table, index);

  const leaving: Table = {
    ...table,
    seats: table.seats.map((seat, i) =>
      i === index && seat ? { ...seat, leaving: true } : seat
    ),
  };
  if (!isInHand(table.hand.betting.seats[inHand])) return leaving;
  const hand = foldInHand(table.hand, inHand, draw);
  const folded = { ...leaving, hand };
  return hand.result ? settleHand(folded) : folded;
};
