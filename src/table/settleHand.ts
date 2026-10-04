/**
 * The table after a hand is over: every player dealt in gets their stack
 * from the hand, winnings included. Then players without chips become
 * spectators (decision 0008), and so do players who stood up during the
 * hand.
 */

import { removeFromSeat } from "./removeFromSeat.js";
import type { Table } from "./Table.js";

/**
 * @throws {Error} If no hand is over
 */
export const settleHand = (table: Table): Table => {
  const { hand } = table;
  if (!hand?.result) throw new Error("No hand is over");
  const stacks = new Map(
    hand.betting.seats.map((seat) => [seat.seat - 1, seat.stack])
  );
  const settled: Table = {
    ...table,
    seats: table.seats.map((seat, index) =>
      seat && stacks.has(index)
        ? { ...seat, stack: stacks.get(index) as number }
        : seat
    ),
  };
  return settled.seats.reduce(
    (current, seat, index) =>
      seat && (seat.stack === 0 || seat.leaving)
        ? removeFromSeat(current, index)
        : current,
    settled
  );
};
