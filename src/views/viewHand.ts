/**
 * What a viewer sees of a hand: the board, the pots, every player's bet and
 * whether they folded or are all-in, and the hole cards the viewer may see,
 * their own and those shown at showdown (decision 0005). Other hole cards are
 * null, whatever happens in the hand.
 */

import { isAllIn } from "../betting/seatStatus.js";
import type { Hand } from "../hand/Hand.js";
import type { HandView } from "./TableView.js";

/**
 * @param viewerSeat - The viewer's seat number, or null for spectators
 */
export const viewHand = (hand: Hand, viewerSeat: number | null): HandView => {
  const { betting } = hand;
  const shown = new Map(
    (hand.result?.shown ?? []).map((shownHand) => [
      shownHand.seat,
      shownHand.cards,
    ])
  );
  return {
    bettingRound: hand.bettingRound,
    board: hand.board,
    pots: betting.pots,
    players: betting.seats.map((seat, index) => ({
      seat: seat.seat,
      bet: seat.bet,
      folded: seat.folded,
      allIn: isAllIn(seat),
      cards:
        seat.seat === viewerSeat
          ? hand.holeCards[index]
          : (shown.get(seat.seat) ?? null),
    })),
    button: betting.seats[betting.button].seat,
    toAct: betting.toAct === null ? null : betting.seats[betting.toAct].seat,
    currentBet: betting.currentBet,
    result: hand.result,
  };
};
