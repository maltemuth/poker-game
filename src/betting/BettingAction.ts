/**
 * What the betting rules accept from the player to act: a fold, or a bet to a
 * total on this street (decision 0002). Checking, calling, raising and going
 * all-in are all bets, to different totals; the buttons a player clicks are
 * translated into these actions in `src/ui`.
 */

export type BettingAction =
  | { type: "fold" }
  /** Make the player's bet on this street `to` chips, whatever they had in before */
  | { type: "bet"; to: number };
