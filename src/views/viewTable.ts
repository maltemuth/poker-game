/**
 * The view of a table for one audience ([audiences](audiences.ts)): a
 * seated player's player ID, or `spectators`. It depends only on the table
 * and the audience, as Remote State's view filter must: no clock, no
 * randomness. An audience that isn't a seated player's ID gets the
 * spectators' view.
 */

import { handIsRunning, seatOf } from "../table/lookups.js";
import type { Table } from "../table/Table.js";
import { availableUiActions } from "../ui/availableUiActions.js";
import { viewHand } from "./viewHand.js";
import type { SeatView, TableView } from "./TableView.js";

/** Chips not in the middle: during a hand, what the player has left in it */
const liveStack = (table: Table, index: number, stack: number): number => {
  if (!handIsRunning(table) || !table.hand) return stack;
  const inHand = table.hand.betting.seats.find((s) => s.seat === index + 1);
  return inHand ? inHand.stack : stack;
};

export const viewTable = (table: Table, audience: string): TableView => {
  const index = seatOf(table, audience);
  const viewerSeat = index === null ? null : index + 1;
  const allHoleCards =
    viewerSeat === null && table.options.spectatorsSeeHoleCards;
  const hand = table.hand && viewHand(table.hand, viewerSeat, allHoleCards);

  const seats = table.seats.map((seat, i): SeatView | null =>
    seat
      ? {
          seat: i + 1,
          playerId: seat.playerId,
          name: seat.name,
          stack: liveStack(table, i, seat.stack),
          sittingOut: seat.sittingOut,
          newPlayer: seat.newPlayer,
          leaving: seat.leaving,
        }
      : null
  );

  const yourTurn =
    viewerSeat !== null && handIsRunning(table) && hand?.toAct === viewerSeat;
  return {
    options: table.options,
    seats,
    spectators: table.spectators,
    hand,
    paused: table.paused,
    handNumber: table.handNumber,
    you:
      viewerSeat === null
        ? null
        : {
            playerId: audience,
            seat: viewerSeat,
            buttons:
              yourTurn && table.hand
                ? availableUiActions(table.hand.betting)
                : [],
          },
  };
};
