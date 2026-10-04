/**
 * Builds fixed decks for hand tests: given each player's hole cards and the
 * board, the cards in the order the hand deals them, one hole card at a time
 * clockwise from the first player left of the button, twice around, then
 * the board.
 */

import type { Card } from "../../src/hand/cards.js";
import { fixedDraw } from "../../src/hand/fixedDraw.js";
import type { Draw } from "../../src/hand/Draw.js";

export const deck = (holes: string[], button: number, board = ""): Draw => {
  const pairs = holes.map((hole) => [hole.slice(0, 2), hole.slice(2, 4)]);
  const order = holes.map((_, step) => (button + 1 + step) % holes.length);
  const cards: Card[] = [
    ...order.map((index) => pairs[index][0]),
    ...order.map((index) => pairs[index][1]),
    ...(board.match(/../g) ?? []),
  ];
  return fixedDraw(cards);
};

export const players = (...stacks: number[]) =>
  stacks.map((stack, index) => ({ seat: index + 1, stack }));
