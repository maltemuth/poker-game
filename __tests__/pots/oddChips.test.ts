/**
 * Tests for the order in which winners get odd chips: clockwise from the
 * first seat left of the button.
 */

import { clockwiseFromButton, oddChipOrder } from "../../src/pots/oddChips.js";
import { round } from "../helpers/betting.js";

it("starts left of the button and goes clockwise", () => {
  const fourSeats = round([{}, {}, {}, {}], { button: 2 });
  expect(clockwiseFromButton(fourSeats)).toEqual([4, 1, 2, 3]);
});

it("orders the winners the same way, whatever order they come in", () => {
  const fourSeats = round([{}, {}, {}, {}], { button: 2 });
  expect(oddChipOrder(fourSeats, [3, 1])).toEqual([1, 3]);
  expect(oddChipOrder(fourSeats, [3, 4])).toEqual([4, 3]);
});
