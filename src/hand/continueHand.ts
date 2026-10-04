/**
 * Moves a hand on whenever its betting round is over: deals the flop, turn
 * or river and starts the next betting round, or ends the hand after the
 * river or when only one player is left. Betting rounds in which no one can
 * act are passed straight through, so when everyone is all-in, the rest of
 * the board is dealt at once.
 */

import { nextBettingRound } from "../betting/nextBettingRound.js";
import { isInHand } from "../betting/seatStatus.js";
import { type Draw, drawCards } from "./Draw.js";
import { endHand } from "./endHand.js";
import type { BettingRoundName, Hand } from "./Hand.js";

const after: Record<
  Exclude<BettingRoundName, "river">,
  { round: BettingRoundName; cards: number }
> = {
  preFlop: { round: "flop", cards: 3 },
  flop: { round: "turn", cards: 1 },
  turn: { round: "river", cards: 1 },
};

const used = (hand: Hand) => [...hand.holeCards.flat(), ...hand.board];

/** The hand, moved on until someone must act or the hand is over */
export const continueHand = (hand: Hand, draw: Draw): Hand => {
  let current = hand;
  while (current.result === null && current.betting.toAct === null) {
    const playersLeft = current.betting.seats.filter(isInHand).length;
    if (playersLeft < 2 || current.bettingRound === "river") {
      current = endHand(current);
      continue;
    }
    const next = after[current.bettingRound];
    current = {
      ...current,
      board: [...current.board, ...drawCards(used(current), next.cards, draw)],
      bettingRound: next.round,
      betting: nextBettingRound(current.betting),
    };
  }
  return current;
};
