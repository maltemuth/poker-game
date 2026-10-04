/**
 * A fixed deck, for tests: deals the given cards in order. Hole cards are
 * dealt one at a time, clockwise from the first player left of the button,
 * twice around; then the flop, turn and river ([startHand](startHand.ts)).
 */

import type { Card } from "./cards.js";
import type { Draw } from "./Draw.js";

/**
 * @throws {Error} When a card is drawn after the last one, or a card that's
 *   already dealt comes up again
 */
export const fixedDraw = (cards: Card[]): Draw => {
  let next = 0;
  return (out) => {
    if (next >= cards.length) throw new Error("The fixed deck is used up");
    const card = cards[next++];
    if (!out.includes(card)) throw new Error(`${card} isn't out`);
    return card;
  };
};
