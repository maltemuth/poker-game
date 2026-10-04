/**
 * The first betting round of a hand: the small and big blind are posted, and
 * the player after the big blind acts first.
 *
 * The small blind sits left of the button, and the big blind left of the
 * small blind. Heads-up, the button posts the small blind, so it acts first
 * before the flop. A player who can't cover a blind posts what they have and
 * is all-in. Everyone must still match the full big blind to play.
 */

import type { BettingRound, BettingSeat } from "./BettingRound.js";
import { nextToAct } from "./nextToAct.js";

export interface Blinds {
  small: number;
  big: number;
}

/** A player dealt into the hand, before the blinds */
export interface DealtSeat {
  /** The seat number at the table */
  seat: number;
  stack: number;
}

const post = (player: DealtSeat, blind: number): BettingSeat => {
  const bet = Math.min(blind, player.stack);
  return {
    seat: player.seat,
    stack: player.stack - bet,
    bet,
    committed: bet,
    folded: false,
    actedAt: null,
  };
};

const sitIn = (player: DealtSeat): BettingSeat => post(player, 0);

/**
 * Posts the blinds for the players dealt in, in clockwise order, with the
 * button at index `button`.
 *
 * @throws {Error} With fewer than two players, or a player without chips;
 *   the table deals in only players who can play.
 */
export const postBlinds = (
  players: DealtSeat[],
  button: number,
  blinds: Blinds
): BettingRound => {
  if (players.length < 2) throw new Error("A hand needs two players");
  if (players.some((player) => player.stack <= 0)) {
    throw new Error("Every player dealt in needs chips");
  }

  const smallBlind =
    players.length === 2 ? button : (button + 1) % players.length;
  const bigBlind = (smallBlind + 1) % players.length;
  const seats = players.map((player, index) =>
    index === smallBlind
      ? post(player, blinds.small)
      : index === bigBlind
        ? post(player, blinds.big)
        : sitIn(player)
  );

  const round: BettingRound = {
    seats,
    button,
    toAct: null,
    currentBet: blinds.big,
    minRaise: blinds.big,
    bigBlind: blinds.big,
  };
  return { ...round, toAct: nextToAct(round, bigBlind) };
};
