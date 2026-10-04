/**
 * Tests for drawing cards: from the cards still out, with a fixed deck for
 * tests and at random for real hands.
 */

import { drawCards } from "../../src/hand/Draw.js";
import { fixedDraw } from "../../src/hand/fixedDraw.js";
import { randomDraw } from "../../src/hand/randomDraw.js";

it("deals a fixed deck in order", () => {
  expect(drawCards([], 3, fixedDraw(["Ah", "Kd", "2c"]))).toEqual([
    "Ah",
    "Kd",
    "2c",
  ]);
});

it("refuses a fixed card that's already dealt or used up", () => {
  expect(() => drawCards(["Ah"], 1, fixedDraw(["Ah"]))).toThrow("Ah isn't out");
  expect(() => drawCards([], 2, fixedDraw(["Ah"]))).toThrow(
    "The fixed deck is used up"
  );
});

it("refuses a draw that picks a card that isn't out", () => {
  expect(() => drawCards(["Ah"], 1, () => "Ah")).toThrow("Ah isn't out");
});

it("draws random cards from the cards still out, each once", () => {
  const used = ["Ah", "Kd"];
  const drawn = drawCards(used, 50, randomDraw);
  expect(new Set([...used, ...drawn]).size).toBe(52);
});
