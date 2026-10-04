/**
 * What a viewer sees of a hand: the board, the pots, every player's bet and
 * whether they folded or are all-in, and the hole cards the viewer may see:
 * - their own;
 * - the hands still in, once they're tabled (decision 0015);
 * - the hands shown at showdown (decision 0005);
 * - every hand, for spectators at a table that allows it (decision 0016).
 * Other hole cards are null, whatever happens in the hand.
 */

import { isAllIn, isInHand } from "../betting/seatStatus.js";
import type { Hand } from "../hand/Hand.js";
import type { HandView } from "./TableView.js";

/**
 * @param viewerSeat - The viewer's seat number, or null for spectators
 * @param allHoleCards - The viewer may see every hole card: spectators at a
 *   table that allows it
 */
export const viewHand = (
  hand: Hand,
  viewerSeat: number | null,
  allHoleCards = false
): HandView => {
  const { betting } = hand;
  const shown = new Set((hand.result?.shown ?? []).map((s) => s.seat));
  const visible = (index: number): boolean => {
    const seat = betting.seats[index];
    return (
      allHoleCards ||
      seat.seat === viewerSeat ||
      shown.has(seat.seat) ||
      (hand.tabled && isInHand(seat))
    );
  };
  return {
    bettingRound: hand.bettingRound,
    board: hand.board,
    pots: betting.pots,
    players: betting.seats.map((seat, index) => ({
      seat: seat.seat,
      bet: seat.bet,
      folded: seat.folded,
      allIn: isAllIn(seat),
      cards: visible(index) ? hand.holeCards[index] : null,
    })),
    button: betting.seats[betting.button].seat,
    toAct: betting.toAct === null ? null : betting.seats[betting.toAct].seat,
    currentBet: betting.currentBet,
    turn: hand.turn,
    tabled: hand.tabled,
    result: hand.result,
  };
};
