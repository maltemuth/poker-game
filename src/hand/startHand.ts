/**
 * The start of a hand: the blinds are posted, and every player is dealt two
 * hole cards, one at a time, clockwise from the first player left of the
 * button. If the blinds leave no one to act, the hand moves straight on.
 */

import {
  type Blinds,
  type DealtSeat,
  postBlinds,
} from "../betting/postBlinds.js";
import { clockwiseFromButton } from "../pots/oddChips.js";
import type { Card } from "./cards.js";
import { continueHand } from "./continueHand.js";
import { type Draw, drawCards } from "./Draw.js";
import type { Hand } from "./Hand.js";

export interface StartHandOptions {
  /** Indices into the players of new players who post a big blind too */
  extraBigBlinds?: number[];
  /** Deal an all-in runout one betting round at a time (decision 0015) */
  pacedRunout?: boolean;
}

/**
 * @param players - The players dealt in, in clockwise order
 * @param button - Index into `players` of the button
 * @throws {Error} For hands postBlinds refuses: fewer than two players, a
 *   player without chips, or an extra big blind from a blind
 */
export const startHand = (
  players: DealtSeat[],
  button: number,
  blinds: Blinds,
  draw: Draw,
  { extraBigBlinds = [], pacedRunout = false }: StartHandOptions = {}
): Hand => {
  const betting = postBlinds(players, button, blinds, extraBigBlinds);
  const order = clockwiseFromButton(betting).map((seat) =>
    betting.seats.findIndex((other) => other.seat === seat)
  );
  const holeCards: Card[][] = players.map(() => []);
  for (let card = 0; card < 2; card++) {
    for (const index of order) {
      const [dealt] = drawCards(holeCards.flat(), 1, draw);
      holeCards[index].push(dealt);
    }
  }
  return continueHand(
    {
      betting,
      holeCards,
      board: [],
      bettingRound: "preFlop",
      result: null,
      turn: 0,
      tabled: false,
      pacedRunout,
    },
    draw
  );
};
