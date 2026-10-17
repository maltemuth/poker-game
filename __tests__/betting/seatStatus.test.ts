/**
 * Tests for a seat's standing in the hand: in it, all-in, or able to act.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { canAct, isAllIn, isInHand } from "../../src/betting/seatStatus.js";
import { seat } from "../helpers/betting.js";

it("counts a seat with chips as able to act", () => {
  const playing = seat(0);
  assert.deepEqual(
    [isInHand(playing), isAllIn(playing), canAct(playing)],
    [true, false, true]
  );
});

it("counts a seat without chips as all-in, still in the hand", () => {
  const allIn = seat(0, { stack: 0, bet: 1000 });
  assert.deepEqual(
    [isInHand(allIn), isAllIn(allIn), canAct(allIn)],
    [true, true, false]
  );
});

it("counts a folded seat as out, even with chips or without", () => {
  for (const folded of [
    seat(0, { folded: true }),
    seat(0, { folded: true, stack: 0 }),
  ]) {
    assert.deepEqual(
      [isInHand(folded), isAllIn(folded), canAct(folded)],
      [false, false, false]
    );
  }
});
