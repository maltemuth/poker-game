/**
 * Each hand's chances, for a client to show (decision 0015): computed from a
 * view, when every hand still in is known to the viewer, as in an all-in
 * runout, or for spectators at a table that shows them the hole cards
 * (decision 0016). The odds are exact, over every way to complete the board
 * so far, with poker-hands' WebAssembly package.
 *
 * Folded hands don't count, even when the viewer knows them: the odds are
 * those of the hands still in, as broadcasts show them.
 */

import { odds } from "@malte.muth/poker-hands-wasm";
import type { HandView } from "../views/TableView.js";

export interface PlayerOdds {
  seat: number;
  /** The share of the ways to complete the board on which this hand alone wins */
  winChance: number;
  /** The share on which it ties for the best hand */
  tieChance: number;
}

/**
 * The odds of every hand still in, or null if the viewer doesn't know them
 * all, fewer than two are left, or the hand is over
 */
export const viewOdds = (hand: HandView): PlayerOdds[] | null => {
  if (hand.result) return null;
  const inHand = hand.players.filter((player) => !player.folded);
  if (inHand.length < 2 || inHand.some((player) => player.cards === null)) {
    return null;
  }
  const result = odds(
    inHand.map((player) => player.cards!.join("")),
    hand.board.join("")
  );
  return inHand.map((player, index) => ({
    seat: player.seat,
    winChance: result[index].winChance,
    tieChance: result[index].tieChance,
  }));
};
