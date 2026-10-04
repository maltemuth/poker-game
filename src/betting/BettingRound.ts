/**
 * The state of one betting round: the seats in the hand, what each has bet in
 * it, the bet to match, and the pots collected from earlier betting rounds.
 * It's plain JSON, and the betting rules take one and return a new one.
 * Cards aren't part of it: betting only needs chips and seats.
 */

import type { Pot } from "../pots/Pot.js";

/** One player in the hand, as the betting rules see them */
export interface BettingSeat {
  /** The seat number at the table, which identifies the player */
  seat: number;
  /** Chips not yet put in */
  stack: number;
  /** Chips bet in this betting round */
  bet: number;
  /** Chips put in during the whole hand, this betting round included */
  committed: number;
  folded: boolean;
  /**
   * The bet to match when this seat last acted in this betting round, or null if it
   * hasn't acted on it yet. Posting a blind isn't acting. It decides whether
   * a raise since then reopens the betting for this seat.
   */
  actedAt: number | null;
}

export interface BettingRound {
  /** The seats dealt into the hand, in clockwise order */
  seats: BettingSeat[];
  /** Index into `seats` of the button */
  button: number;
  /** Index into `seats` of the player to act, or null when the round is over */
  toAct: number | null;
  /** The bet everyone still in must match in this betting round */
  currentBet: number;
  /** The least a raise must add to `currentBet`: the last full raise, and at least the big blind */
  minRaise: number;
  /** The big blind, which is also the smallest bet in every betting round */
  bigBlind: number;
  /**
   * The pots, as collected at the end of the last betting round (decision
   * 0003). Bets in the current betting round aren't in them yet.
   */
  pots: Pot[];
}
