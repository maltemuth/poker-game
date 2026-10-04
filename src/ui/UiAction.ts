/**
 * The buttons a player clicks to act, as clients send them. They're
 * translated into the betting rules' actions, a fold or a bet to a total
 * (decision 0002), by [translateUiAction](translateUiAction.ts).
 */

export type UiAction =
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  /** Raise, or bet first on a street, to `to` chips in total on this street */
  | { type: "raise"; to: number }
  | { type: "allIn" };
