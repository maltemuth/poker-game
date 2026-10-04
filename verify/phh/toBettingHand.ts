/**
 * Turns a PHH hand into what the betting rules need: the players' stacks in
 * whole chips, the button, the blinds and the actions. Hands the rules don't
 * cover yet are skipped with a reason.
 *
 * - Amounts are dollars with cents; one chip is one cent.
 * - Players are in clockwise order from the small blind, and the last one has
 *   the button. Heads-up, the button posts the small blind, so PHH lists the
 *   blinds reversed; postBlinds puts them where they belong.
 * - Antes are left out: each player's stack is lowered by their ante, so the
 *   betting is exactly as recorded, but the pots are smaller by the antes.
 */

import type { Blinds, DealtSeat } from "../../src/betting/postBlinds.js";
import type { PhhHand } from "./readHands.js";

export interface BettingHand {
  name: string;
  players: DealtSeat[];
  /** Index of the button in `players` */
  button: number;
  blinds: Blinds;
  actions: string[];
}

const chips = (dollars: number): number => Math.round(dollars * 100);

/** The hand in the betting rules' terms, or why it's skipped */
export const toBettingHand = (hand: PhhHand): BettingHand | string => {
  if (hand.variant !== "NT") return `variant ${hand.variant}`;
  const count = hand.starting_stacks.length;
  const [small, big, ...others] = hand.blinds_or_straddles.map(chips);
  if (!(small > 0 && big > small) || others.some((amount) => amount !== 0)) {
    return "blinds other than a small and a big blind";
  }
  if (chips(hand.min_bet) !== big)
    return "a minimum bet other than the big blind";

  // heads-up, the antes are listed reversed, like the blinds
  const antes = count === 2 ? [...hand.antes].reverse() : hand.antes;
  const stacks = hand.starting_stacks.map(
    (stack, index) => chips(stack) - chips(antes[index] ?? 0)
  );
  if (stacks.some((stack) => stack <= 0)) return "an ante puts a player all-in";

  return {
    name: hand.name,
    players: stacks.map((stack, index) => ({ seat: index + 1, stack })),
    button: count - 1,
    blinds: { small, big },
    actions: hand.actions,
  };
};
