/**
 * Cards as strings, a value and a suit (decision 0004): `"Ah"`, `"Td"`,
 * `"2c"`. This is poker-hands' notation, so cards are converted only to rank
 * hands.
 */

/** A card, such as "Ah" */
export type Card = string;

const values = "23456789TJQKA";
const suits = "hdcs";

/** All 52 cards, in a fixed order: by suit, then value */
export const allCards: readonly Card[] = [...suits].flatMap((suit) =>
  [...values].map((value) => `${value}${suit}`)
);

/** Whether `text` is one of the 52 cards */
export const isCard = (text: string): boolean => allCards.includes(text);

/** The cards not in `used`, in the order of `allCards` */
export const cardsOut = (used: Card[]): Card[] =>
  allCards.filter((card) => !used.includes(card));
