/**
 * Tests for the bet a seat must match: the current bet, or less when only
 * all-in players are left to match.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { betToMatch, othersCanAct } from "../../src/betting/betToMatch.js";
import { round } from "../helpers/betting.js";

it("is the current bet while others can still act", () => {
  const raised = round([{ bet: 100 }, { bet: 300 }, {}], { currentBet: 300 });
  assert.equal(othersCanAct(raised, 0), true);
  assert.equal(betToMatch(raised, 0), 300);
});

it("is what the all-in players bet, when no one else can act", () => {
  // the big blind is all-in for 60 of 100, and the small blind has 50 in
  const shortBigBlind = round(
    [{ folded: true }, { bet: 50 }, { stack: 0, bet: 60 }],
    { currentBet: 100 }
  );
  assert.equal(othersCanAct(shortBigBlind, 1), false);
  assert.equal(betToMatch(shortBigBlind, 1), 60);
});

it("is the whole all-in, when it is the current bet", () => {
  const allInAbove = round([{ bet: 0 }, { stack: 0, bet: 800 }], {
    currentBet: 800,
  });
  assert.equal(betToMatch(allInAbove, 0), 800);
});
