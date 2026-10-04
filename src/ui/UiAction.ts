/**
 * The buttons a player clicks to act, as clients send them. They're
 * translated into the betting rules' actions, a fold or a bet to a total
 * (decision 0002), by [translateUiAction](translateUiAction.ts).
 */

export type UiAction =
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  /** Raise, or bet first in a betting round, to `to` chips in total in this betting round */
  | { type: "raise"; to: number }
  | { type: "allIn" };
