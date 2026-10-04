/**
 * Ranks a player's hole cards with the board, with poker-hands: the best
 * five cards, the hand type, and a rank that orders hands, higher is better
 * and equal for hands that tie. The only place cards are converted to
 * poker-hands' card objects.
 */

import {
  cards as toCards,
  getBestHand,
  HandType,
  type HandTypeName,
  handRank,
  toString,
} from "@malte.muth/poker-hands";
import type { Card } from "./cards.js";

export interface RankedHand {
  /** The best five cards, those that make the hand first, then the kickers */
  best: Card[];
  /** From "highCard" to "royalFlush" */
  type: HandTypeName;
  rank: number;
}

/** "TwoPair" → "twoPair" */
const typeName = (type: HandType): HandTypeName => {
  const name = HandType[type];
  return (name[0].toLowerCase() + name.slice(1)) as HandTypeName;
};

/**
 * @throws {Error} Without any cards; poker-hands finds no hand then
 */
export const rankHand = (hole: Card[], board: Card[]): RankedHand => {
  const hand = getBestHand(toCards(...hole, ...board));
  if (!hand) throw new Error("There are no cards to rank");
  return {
    best: [...hand.cards(), ...hand.kickers()].map(toString),
    type: typeName(hand.type),
    rank: handRank(hand),
  };
};
