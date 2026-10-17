/**
 * Tests for drawing cards: from the cards still out, with a fixed deck for
 * tests and at random for real hands.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { drawCards } from "../../src/hand/Draw.js";
import { fixedDraw } from "../../src/hand/fixedDraw.js";
import { randomDraw } from "../../src/hand/randomDraw.js";

it("deals a fixed deck in order", () => {
  assert.deepEqual(drawCards([], 3, fixedDraw(["Ah", "Kd", "2c"])), [
    "Ah",
    "Kd",
    "2c",
  ]);
});

it("refuses a fixed card that's already dealt or used up", () => {
  assert.throws(() => drawCards(["Ah"], 1, fixedDraw(["Ah"])), {
    message: "Ah isn't out",
  });
  assert.throws(() => drawCards([], 2, fixedDraw(["Ah"])), {
    message: "The fixed deck is used up",
  });
});

it("refuses a draw that picks a card that isn't out", () => {
  assert.throws(() => drawCards(["Ah"], 1, () => "Ah"), {
    message: "Ah isn't out",
  });
});

it("draws random cards from the cards still out, each once", () => {
  const used = ["Ah", "Kd"];
  const drawn = drawCards(used, 50, randomDraw);
  assert.equal(new Set([...used, ...drawn]).size, 52);
});
