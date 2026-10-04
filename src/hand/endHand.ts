/**
 * The end of a hand, once the betting is over. If everyone else folded, the
 * last player wins every pot without showing. Otherwise it's showdown: every
 * player still in shows (decision 0005), their hands are ranked with
 * poker-hands, and each pot goes to the best hand that can win it.
 */

import { isInHand } from "../betting/seatStatus.js";
import { awardPots } from "../pots/awardPots.js";
import type { Hand, ShownHand } from "./Hand.js";
import { rankHand } from "./rankHand.js";

/**
 * @throws {Error} If the betting isn't over
 */
export const endHand = (hand: Hand): Hand => {
  const { betting } = hand;
  const inHand = betting.seats.flatMap((seat, index) =>
    isInHand(seat) ? [index] : []
  );
  const shown: ShownHand[] =
    inHand.length < 2
      ? []
      : inHand.map((index) => ({
          seat: betting.seats[index].seat,
          cards: hand.holeCards[index],
          ...rankHand(hand.holeCards[index], hand.board),
        }));
  const ranks = Object.fromEntries(shown.map((s) => [s.seat, s.rank]));
  const { round, awards } = awardPots(betting, ranks);
  return { ...hand, betting: round, result: { shown, awards } };
};
