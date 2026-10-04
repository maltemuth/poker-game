/**
 * The state of one hand: the betting, every seat's hole cards, the board,
 * which betting round is played, the turn, and once the hand is over, its
 * result. It's plain JSON. The hole cards are in it, so it must never be
 * sent to players as it is; the view filter decides who sees what.
 */

import type { BettingRound } from "../betting/BettingRound.js";
import type { Award } from "../pots/splitPot.js";
import type { Card } from "./cards.js";
import type { RankedHand } from "./rankHand.js";

/** The four betting rounds, each after the cards dealt before it */
export type BettingRoundName = "preFlop" | "flop" | "turn" | "river";

/** A hand shown at showdown */
export interface ShownHand extends RankedHand {
  seat: number;
  /** The hole cards */
  cards: Card[];
}

export interface HandResult {
  /** The hands shown at showdown, in seat order; empty if everyone else folded */
  shown: ShownHand[];
  /** Who won what, per pot, the main pot first */
  awards: Award[][];
}

export interface Hand {
  /** The betting; once the hand is over, its stacks include the winnings */
  betting: BettingRound;
  /** Each seat's two hole cards, by index into `betting.seats` */
  holeCards: Card[][];
  board: Card[];
  /** The betting round being played, or the last one played once the hand is over */
  bettingRound: BettingRoundName;
  /** Null while the hand is played */
  result: HandResult | null;
  /**
   * Counts the turns: 0 for the first player to act, and one more with every
   * action taken in turn. A fold out of turn doesn't start a new turn.
   */
  turn: number;
  /** No more betting is possible: the hands still in are face up (decision 0015) */
  tabled: boolean;
  /** An all-in runout is dealt one betting round at a time, by `dealRunout` */
  pacedRunout: boolean;
}
