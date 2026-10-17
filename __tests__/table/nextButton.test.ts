/**
 * Tests for moving the button: to the next seat in the game, skipping
 * empty and waiting seats, wrapping around the table.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { nextButton } from "../../src/table/nextButton.js";

it("starts at the first seat in the game", () => {
  assert.equal(nextButton(null, [1, 3, 4], 6), 1);
});

it("moves to the next seat in the game, skipping the others", () => {
  assert.equal(nextButton(1, [1, 3, 4], 6), 3);
  assert.equal(nextButton(3, [1, 3, 4], 6), 4);
});

it("wraps around the table", () => {
  assert.equal(nextButton(4, [1, 3, 4], 6), 1);
});

it("moves on from a seat whose player has left", () => {
  assert.equal(nextButton(2, [1, 3, 4], 6), 3);
});
