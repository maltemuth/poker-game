/**
 * Tests for applying an accepted action: chips moving from the stack to the
 * bet, raises setting the bet to match and the minimum raise, and the turn
 * passing on.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { assertMatchObject } from "../helpers/assert.js";
import { applyAction } from "../../src/betting/applyAction.js";
import type { BettingAction } from "../../src/betting/BettingAction.js";
import { chips, round } from "../helpers/betting.js";

const bet = (to: number): BettingAction => ({ type: "bet", to });
const fold: BettingAction = { type: "fold" };

// blinds of 50 and 100 posted by seats 1 and 2; seat 3 acts first
const blinds = round(
  [{}, { bet: 50, stack: 950 }, { bet: 100, stack: 900 }, {}],
  { toAct: 3, currentBet: 100 }
);

it("moves the chips of a call from the stack to the bet", () => {
  const called = applyAction(blinds, bet(100));
  assertMatchObject(called.seats[3], {
    stack: 900,
    bet: 100,
    committed: 100,
    actedAt: 100,
  });
  assert.equal(called.currentBet, 100);
  assert.equal(called.toAct, 0);
});

it("makes a raise the bet to match, and a full raise the next minimum", () => {
  const raised = applyAction(blinds, bet(350));
  assert.equal(raised.currentBet, 350);
  assert.equal(raised.minRaise, 250);
  assert.equal(raised.seats[3].actedAt, 350);
});

it("keeps the minimum raise after an all-in for less than a full raise", () => {
  const short = round(
    [{ bet: 300, actedAt: 300 }, { bet: 100, stack: 300 }, {}],
    { currentBet: 300, minRaise: 200 }
  );
  const allIn = applyAction(short, bet(400));
  assert.equal(allIn.currentBet, 400);
  assert.equal(allIn.minRaise, 200);
  assert.equal(allIn.seats[1].stack, 0);
});

it("folds a seat and passes the turn", () => {
  const folded = applyAction(blinds, fold);
  assert.equal(folded.seats[3].folded, true);
  assert.equal(folded.toAct, 0);
});

it("ends the round when the last player matches", () => {
  // everyone calls, the big blind checks its option
  const called = [bet(100), bet(100), bet(100), bet(100)].reduce(
    applyAction,
    blinds
  );
  assert.equal(called.toAct, null);
  assert.deepEqual(
    called.seats.map((seat) => seat.bet),
    [100, 100, 100, 100]
  );
});

it("ends the round when everyone else folds", () => {
  const foldedToBigBlind = [fold, fold, fold].reduce(applyAction, blinds);
  assert.equal(foldedToBigBlind.toAct, null);
});

it("doesn't modify the round it's given", () => {
  const before = structuredClone(blinds);
  applyAction(blinds, bet(350));
  assert.deepEqual(blinds, before);
});

it("conserves chips", () => {
  const actions = [bet(300), bet(300), fold, bet(1000), bet(1000), fold];
  let current = blinds;
  for (const action of actions) {
    current = applyAction(current, action);
    assert.equal(chips(current), chips(blinds));
  }
});

it("refuses an action that checkAction rejects", () => {
  assert.throws(() => applyAction(blinds, bet(150)), {
    message: "Invalid action: A raise must be to at least 200",
  });
});
