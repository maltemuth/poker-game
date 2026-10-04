/**
 * Tests for moving the button: to the next seat in the game, skipping
 * empty and waiting seats, wrapping around the table.
 */

import { nextButton } from "../../src/table/nextButton.js";

it("starts at the first seat in the game", () => {
  expect(nextButton(null, [1, 3, 4], 6)).toBe(1);
});

it("moves to the next seat in the game, skipping the others", () => {
  expect(nextButton(1, [1, 3, 4], 6)).toBe(3);
  expect(nextButton(3, [1, 3, 4], 6)).toBe(4);
});

it("wraps around the table", () => {
  expect(nextButton(4, [1, 3, 4], 6)).toBe(1);
});

it("moves on from a seat whose player has left", () => {
  expect(nextButton(2, [1, 3, 4], 6)).toBe(3);
});
