/**
 * The totals the player to act may bet to. A fold is always allowed; the
 * bets are the call (a check when nothing is owed) and, when raising is
 * allowed, a range of raises up to everything the player has.
 *
 * Raising is allowed only if
 * - the player has more than the call,
 * - someone else could still act on a raise, and
 * - the betting is open to this player: they haven't acted in this betting round,
 *   or the bet has gone up by at least a full raise since they did. An
 *   all-in for less than a full raise doesn't reopen the betting for players
 *   who have already acted; they may only call or fold.
 *
 * A raise must add at least the last full raise (at least the big blind) to
 * the current bet, unless the player goes all-in for less.
 */

import type { BettingRound } from "./BettingRound.js";
import { betToMatch, othersCanAct } from "./betToMatch.js";

export interface RaiseRange {
  /** The smallest total to raise to */
  min: number;
  /** The largest total: everything the player has */
  max: number;
}

export interface AllowedBets {
  /** Index into the round's seats of the player to act */
  index: number;
  /**
   * The total of a call: the bet to match, or everything the player has if
   * that's less. When it's the player's bet already, the call is a check.
   */
  call: number;
  /** The totals a raise may go to, or null if raising isn't allowed */
  raise: RaiseRange | null;
  /** Why raising isn't allowed, or null if it is */
  noRaise: string | null;
}

const whyNoRaise = (
  round: BettingRound,
  index: number,
  call: number
): string | null => {
  const seat = round.seats[index];
  const everything = seat.bet + seat.stack;
  if (everything <= call) return "You don't have enough chips to raise";
  if (!othersCanAct(round, index)) return "Everyone else is all-in";
  const reopened =
    seat.actedAt === null || round.currentBet - seat.actedAt >= round.minRaise;
  if (!reopened) {
    return "The betting wasn't reopened by a full raise; you can only call or fold";
  }
  return null;
};

/** What the player to act may bet to, or null if the round is over */
export const allowedBets = (round: BettingRound): AllowedBets | null => {
  const index = round.toAct;
  if (index === null) return null;
  const seat = round.seats[index];
  const everything = seat.bet + seat.stack;
  const call = Math.min(betToMatch(round, index), everything);
  const noRaise = whyNoRaise(round, index, call);
  const raise =
    noRaise === null
      ? {
          min: Math.min(round.currentBet + round.minRaise, everything),
          max: everything,
        }
      : null;
  return { index, call, raise, noRaise };
};
