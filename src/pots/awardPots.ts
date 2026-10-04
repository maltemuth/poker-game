/**
 * The end of a hand: the last bets are collected (decision 0003), every pot
 * goes to its winners, and the winnings go onto their stacks. Afterwards no
 * chips are in the middle, so the stacks hold every chip.
 *
 * When everyone else folded, the last seat in the hand wins every pot
 * without a rank. At showdown, every seat still in the hand needs one.
 */

import type { BettingRound } from "../betting/BettingRound.js";
import { collectBets } from "./collectBets.js";
import { clockwiseFromButton } from "./oddChips.js";
import { type Award, type Ranks, splitPot } from "./splitPot.js";

export interface AwardedHand {
  /** The round with the winnings on the stacks, and nothing left in the middle */
  round: BettingRound;
  /** Who won what, per pot, the main pot first */
  awards: Award[][];
}

/**
 * @throws {Error} If the betting isn't over, or a seat at showdown has no rank
 */
export const awardPots = (round: BettingRound, ranks: Ranks): AwardedHand => {
  const collected = collectBets(round);
  const order = clockwiseFromButton(collected);
  const awards = collected.pots.map((pot) => splitPot(pot, ranks, order));
  const won = (seat: number) =>
    awards
      .flat()
      .filter((award) => award.seat === seat)
      .reduce((sum, award) => sum + award.amount, 0);

  return {
    round: {
      ...collected,
      seats: collected.seats.map((seat) => ({
        ...seat,
        stack: seat.stack + won(seat.seat),
        committed: 0,
      })),
      pots: [],
    },
    awards,
  };
};
