/**
 * Tests for who acts next: skipping folded and all-in seats, the big blind's
 * option, and the end of a betting round.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { nextToAct } from "../../src/betting/nextToAct.js";
import { round } from "../helpers/betting.js";

it("goes clockwise, wrapping around the table", () => {
  const fresh = round([{}, {}, {}]);
  assert.equal(nextToAct(fresh, 0), 1);
  assert.equal(nextToAct(fresh, 2), 0);
});

it("skips folded and all-in seats", () => {
  const someOut = round(
    [{}, { folded: true }, { stack: 0, bet: 100, actedAt: 100 }, {}],
    { currentBet: 100 }
  );
  assert.equal(nextToAct(someOut, 0), 3);
});

it("asks a seat that owes chips, even if it acted before", () => {
  const raised = round(
    [
      { bet: 100, actedAt: 100 },
      { bet: 300, actedAt: 300 },
    ],
    { currentBet: 300 }
  );
  assert.equal(nextToAct(raised, 1), 0);
});

it("gives a seat that hasn't acted its turn, like the big blind before the flop", () => {
  // everyone called the big blind of seat 2, who hasn't acted yet
  const called = round(
    [{ bet: 100, actedAt: 100 }, { bet: 100, actedAt: 100 }, { bet: 100 }],
    { currentBet: 100 }
  );
  assert.equal(nextToAct(called, 1), 2);
});

it("ends the round when everyone has acted and matched the bet", () => {
  const matched = round(
    [{ bet: 200, actedAt: 200 }, { bet: 200, actedAt: 200 }, { folded: true }],
    { currentBet: 200 }
  );
  assert.equal(nextToAct(matched, 1), null);
});

it("ends the round when only one seat is left in the hand", () => {
  const foldedAround = round([{}, { folded: true }, { folded: true }]);
  assert.equal(nextToAct(foldedAround, 0), null);
});

it("ends the round when no one could bet against the last seat that can act", () => {
  // seat 1 is all-in; seat 0 has matched it, or hasn't acted in a new betting round
  const matchedAllIn = round(
    [
      { bet: 500, actedAt: 500 },
      { stack: 0, bet: 500 },
    ],
    { currentBet: 500 }
  );
  assert.equal(nextToAct(matchedAllIn, 1), null);
  const newRound = round([{}, { stack: 0 }]);
  assert.equal(nextToAct(newRound, 1), null);
});

it("still asks the last seat that can act to call an all-in", () => {
  const facingAllIn = round([{ bet: 100 }, { stack: 0, bet: 800 }], {
    currentBet: 800,
  });
  assert.equal(nextToAct(facingAllIn, 1), 0);
});

it("doesn't ask the last seat that can act to match more than the all-in players bet", () => {
  // heads-up, the big blind is all-in for 40, less than the small blind of 50
  const shortBigBlind = round(
    [
      { bet: 50, stack: 950 },
      { stack: 0, bet: 40 },
    ],
    { currentBet: 100 }
  );
  assert.equal(nextToAct(shortBigBlind, 1), null);
});
