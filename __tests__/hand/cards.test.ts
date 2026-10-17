/**
 * Tests for cards as strings: the 52 cards, and the cards still out.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { allCards, cardsOut, isCard } from "../../src/hand/cards.js";

it("has 52 different cards", () => {
  assert.equal(allCards.length, 52);
  assert.equal(new Set(allCards).size, 52);
  assert.deepEqual(allCards.slice(0, 3), ["2h", "3h", "4h"]);
});

it("recognizes cards", () => {
  for (const card of ["Ah", "Td", "2c", "Ks"]) assert.equal(isCard(card), true);
  for (const text of ["1h", "AH", "10d", "A", ""]) {
    assert.equal(isCard(text), false);
  }
});

it("lists the cards still out", () => {
  const out = cardsOut(["Ah", "Kd"]);
  assert.equal(out.length, 50);
  assert.ok(!out.includes("Ah"));
  assert.ok(!out.includes("Kd"));
});
