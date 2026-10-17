/**
 * Tests for the order in which winners get odd chips: clockwise from the
 * first seat left of the button.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { clockwiseFromButton, oddChipOrder } from "../../src/pots/oddChips.js";
import { round } from "../helpers/betting.js";

it("starts left of the button and goes clockwise", () => {
  const fourSeats = round([{}, {}, {}, {}], { button: 2 });
  assert.deepEqual(clockwiseFromButton(fourSeats), [4, 1, 2, 3]);
});

it("orders the winners the same way, whatever order they come in", () => {
  const fourSeats = round([{}, {}, {}, {}], { button: 2 });
  assert.deepEqual(oddChipOrder(fourSeats, [3, 1]), [1, 3]);
  assert.deepEqual(oddChipOrder(fourSeats, [3, 4]), [4, 3]);
});
