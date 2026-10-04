/**
 * Deals the next hand at a table: the players to deal in, the button and the
 * new players' extra big blinds come from [playersToDeal](playersToDeal.ts).
 * New players who are dealt in are in the game from then on. If the blinds
 * leave no one to act, the hand is played out and settled at once.
 *
 * Nothing starts hands by itself yet: the host does, through Remote State's
 * `act` (decision 0012), and later a timer. A paused table deals none.
 */

import type { Draw } from "../hand/Draw.js";
import { startHand } from "../hand/startHand.js";
import { handIsRunning } from "./lookups.js";
import { playersToDeal } from "./playersToDeal.js";
import { settleHand } from "./settleHand.js";
import type { Table } from "./Table.js";

export const checkStartHand = (table: Table): true | string => {
  if (handIsRunning(table)) return "A hand is being played";
  if (table.paused) return "The table is paused";
  if (!playersToDeal(table)) return "Waiting for players";
  return true;
};

/**
 * @throws {Error} If `checkStartHand` refuses
 */
export const startNextHand = (table: Table, draw: Draw): Table => {
  const ready = checkStartHand(table);
  if (ready !== true) throw new Error(`Can't start a hand: ${ready}`);
  const deal = playersToDeal(table)!;
  const seats = table.seats.map((seat, index) =>
    seat && deal.seats.includes(index) ? { ...seat, newPlayer: false } : seat
  );
  const players = deal.seats.map((index) => ({
    seat: index + 1,
    stack: (seats[index] as { stack: number }).stack,
  }));
  const hand = startHand(
    players,
    deal.seats.indexOf(deal.button),
    table.options.blinds,
    draw,
    {
      extraBigBlinds: deal.extraBigBlinds.map((index) =>
        deal.seats.indexOf(index)
      ),
      pacedRunout: table.options.runoutDelay !== null,
    }
  );
  const started: Table = {
    ...table,
    seats,
    button: deal.button,
    hand,
    handNumber: table.handNumber + 1,
  };
  return hand.result ? settleHand(started) : started;
};
