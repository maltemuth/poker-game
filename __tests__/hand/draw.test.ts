/**
 * Tests for drawing cards: from the cards still out, with a fixed deck for
 * tests and at random for real hands.
 */

import assert from "node:assert/strict";
import { it, mock } from "node:test";
import { drawCards } from "../../src/hand/Draw.js";
import { fixedDraw } from "../../src/hand/fixedDraw.js";
import { randomBelow, randomDraw } from "../../src/hand/randomDraw.js";

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

it("picks every number below the limit, and nothing else", () => {
  const seen = new Set<number>();
  for (let i = 0; i < 200; i++) seen.add(randomBelow(4));
  assert.deepEqual([...seen].sort(), [0, 1, 2, 3]);
});

it("draws again from the top, incomplete run, so every number is equally likely", () => {
  // 2^32 leaves 1 over when split into threes: the largest value is drawn again
  const values = [2 ** 32 - 1, 5];
  const getRandomValues = mock.method(
    globalThis.crypto,
    "getRandomValues",
    (array: Uint32Array) => {
      array[0] = values.shift()!;
      return array;
    }
  );
  try {
    assert.equal(randomBelow(3), 2);
    assert.equal(getRandomValues.mock.callCount(), 2);
  } finally {
    getRandomValues.mock.restore();
  }
});
