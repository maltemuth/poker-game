/**
 * Who is dealt into the next hand, where the button is, and which new
 * players post an extra big blind.
 *
 * The players in the game are dealt in, and the button moves among them
 * (decision 0007). New players join by the table's `newPlayers` rule
 * (decision 0006):
 * - `nextHand`: there are none; everyone who sits down is in the game.
 * - `waitForBigBlind`: a new player is dealt in when their seat would be the
 *   big blind, at most one per hand.
 * - `postBigBlind`: new players are dealt in and post a big blind, unless
 *   their seat is the small blind's; then they wait a hand. One whose seat
 *   is the big blind's simply posts the big blind.
 *
 * With fewer than two players in the game, the game is starting: everyone
 * seated and not sitting out is dealt in, new or not.
 */

import { blindPositions } from "../betting/postBlinds.js";
import { playingSeats } from "./lookups.js";
import { nextButton } from "./nextButton.js";
import type { Table } from "./Table.js";

export interface Deal {
  /** Indices of the seats dealt in, in seat order */
  seats: number[];
  /** Index of the button's seat */
  button: number;
  /** Indices of the seats of new players who post an extra big blind */
  extraBigBlinds: number[];
}

const inSeatOrder = (seats: number[]) => [...seats].sort((a, b) => a - b);

const positions = (seats: number[], button: number) => {
  const { smallBlind, bigBlind } = blindPositions(
    seats.length,
    seats.indexOf(button)
  );
  return { smallBlind: seats[smallBlind], bigBlind: seats[bigBlind] };
};

/** The next deal, or null if fewer than two players can be dealt in */
export const playersToDeal = (table: Table): Deal | null => {
  const seatCount = table.seats.length;
  const seatedIn = table.seats.flatMap((seat, index) =>
    seat && !seat.sittingOut ? [index] : []
  );
  const playing = playingSeats(table);

  if (playing.length < 2) {
    if (seatedIn.length < 2) return null;
    const button = nextButton(table.button, seatedIn, seatCount);
    return { seats: seatedIn, button, extraBigBlinds: [] };
  }

  const button = nextButton(table.button, playing, seatCount);
  const newPlayers = seatedIn
    .filter((index) => !playing.includes(index))
    .sort(
      (a, b) =>
        ((a - button + seatCount) % seatCount) -
        ((b - button + seatCount) % seatCount)
    );

  if (table.options.newPlayers === "waitForBigBlind") {
    for (const newPlayer of newPlayers) {
      const seats = inSeatOrder([...playing, newPlayer]);
      if (positions(seats, button).bigBlind === newPlayer) {
        return { seats, button, extraBigBlinds: [] };
      }
    }
    return { seats: playing, button, extraBigBlinds: [] };
  }

  if (table.options.newPlayers === "postBigBlind") {
    let seats = inSeatOrder([...playing, ...newPlayers]);
    for (;;) {
      const { smallBlind } = positions(seats, button);
      if (!newPlayers.includes(smallBlind)) break;
      seats = seats.filter((seat) => seat !== smallBlind);
    }
    const { bigBlind } = positions(seats, button);
    const extraBigBlinds = seats.filter(
      (seat) => newPlayers.includes(seat) && seat !== bigBlind
    );
    return { seats, button, extraBigBlinds };
  }

  return { seats: playing, button, extraBigBlinds: [] };
};
