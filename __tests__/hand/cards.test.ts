/**
 * Tests for cards as strings: the 52 cards, and the cards still out.
 */

import { allCards, cardsOut, isCard } from "../../src/hand/cards.js";

it("has 52 different cards", () => {
  expect(allCards).toHaveLength(52);
  expect(new Set(allCards).size).toBe(52);
  expect(allCards.slice(0, 3)).toEqual(["2h", "3h", "4h"]);
});

it("recognizes cards", () => {
  for (const card of ["Ah", "Td", "2c", "Ks"]) expect(isCard(card)).toBe(true);
  for (const text of ["1h", "AH", "10d", "A", ""]) {
    expect(isCard(text)).toBe(false);
  }
});

it("lists the cards still out", () => {
  const out = cardsOut(["Ah", "Kd"]);
  expect(out).toHaveLength(50);
  expect(out).not.toContain("Ah");
  expect(out).not.toContain("Kd");
});
