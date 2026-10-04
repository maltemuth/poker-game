/**
 * Moves a hand on whenever its betting round is over: deals the flop, turn
 * or river and starts the next betting round, or ends the hand after the
 * river or when only one player is left.
 *
 * Once no more betting is possible, with at most one player still able to
 * bet, the hands still in are tabled for everyone to see (decision 0015).
 * The rest of the board is then dealt at once, or, in a hand with a paced
 * runout, one betting round's cards at a time by [dealRunout](dealRunout.ts).
 */

import { nextBettingRound } from "../betting/nextBettingRound.js";
import { canAct, isInHand } from "../betting/seatStatus.js";
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

/**
 * Deals the next betting round's cards and starts its betting, or ends the
 * hand after the river or when only one player is left
 */
export const dealNext = (hand: Hand, draw: Draw): Hand => {
  const playersLeft = hand.betting.seats.filter(isInHand).length;
  if (playersLeft < 2 || hand.bettingRound === "river") return endHand(hand);
  const next = after[hand.bettingRound];
  return {
    ...hand,
    board: [...hand.board, ...drawCards(used(hand), next.cards, draw)],
    bettingRound: next.round,
    betting: nextBettingRound(hand.betting),
  };
};

/** No one can bet any more, though board cards are still to come */
const bettingIsOver = (hand: Hand): boolean =>
  hand.betting.seats.filter(isInHand).length >= 2 &&
  hand.bettingRound !== "river" &&
  hand.betting.seats.filter(canAct).length <= 1;

/** The hand, moved on until someone must act, a paced runout waits, or the hand is over */
export const continueHand = (hand: Hand, draw: Draw): Hand => {
  let current = hand;
  while (current.result === null && current.betting.toAct === null) {
    if (bettingIsOver(current)) {
      current = { ...current, tabled: true };
      if (current.pacedRunout) return current;
    }
    current = dealNext(current, draw);
  }
  return current;
};
