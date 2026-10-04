/**
 * The buttons that apply to the player to act, with what a client needs to
 * show them: how much a call adds, the range a raise may go to, and whether
 * a raise is the first bet on the street, which clients may label "bet".
 * Every button listed translates into an action the rules accept.
 */

import type { BettingRound } from "../betting/BettingRound.js";
import { allowedBets } from "../betting/allowedBets.js";

export type UiOption =
  | { type: "fold" }
  | { type: "check" }
  /** `amount` is what the call adds; `allIn` if it's everything the player has */
  | { type: "call"; amount: number; allIn: boolean }
  /** `min` and `max` are totals on this street; `firstBet` if no one has bet yet */
  | { type: "raise"; min: number; max: number; firstBet: boolean }
  /** `to` is everything the player has, as a total on this street */
  | { type: "allIn"; to: number };

/** The buttons for the player to act, in the order a client might show them; empty when the round is over */
export const availableUiActions = (round: BettingRound): UiOption[] => {
  const allowed = allowedBets(round);
  if (!allowed) return [];
  const seat = round.seats[allowed.index];
  const everything = seat.bet + seat.stack;
  const owed = allowed.call - seat.bet;

  const options: UiOption[] = [{ type: "fold" }];
  options.push(
    owed === 0
      ? { type: "check" }
      : { type: "call", amount: owed, allIn: allowed.call === everything }
  );
  if (allowed.raise) {
    options.push(
      {
        type: "raise",
        ...allowed.raise,
        firstBet: round.currentBet === 0,
      },
      { type: "allIn", to: allowed.raise.max }
    );
  }
  return options;
};
