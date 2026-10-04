/**
 * How cards are dealt: no deck is stored, and each card is drawn when it's
 * dealt, from the cards no one holds and the board doesn't show (decision
 * 0004). The host passes `randomDraw`; tests pass a `fixedDraw` to deal
 * known cards.
 */

import { type Card, cardsOut } from "./cards.js";

/** Picks the next card from the cards still out */
export type Draw = (out: Card[]) => Card;

/**
 * Draws `count` cards one by one, each from the cards still out.
 *
 * @throws {Error} If `draw` picks a card that isn't out
 */
export const drawCards = (used: Card[], count: number, draw: Draw): Card[] => {
  const drawn: Card[] = [];
  for (let i = 0; i < count; i++) {
    const out = cardsOut([...used, ...drawn]);
    const card = draw(out);
    if (!out.includes(card)) throw new Error(`${card} isn't out`);
    drawn.push(card);
  }
  return drawn;
};
