/**
 * Tests for the totals the player to act may bet to: checks and calls, the
 * minimum raise, short stacks, and raises that don't reopen the betting.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertMatchObject } from "../helpers/assert.js";
import { allowedBets } from "../../src/betting/allowedBets.js";
import { round } from "../helpers/betting.js";

it("allows a check and a bet of at least the big blind when nothing is bet", () => {
  assert.deepEqual(allowedBets(round([{}, {}])), {
    index: 1,
    call: 0,
    raise: { min: 100, max: 1000 },
    noRaise: null,
  });
});

it("allows a call and a raise by at least the last full raise", () => {
  // seat 0 raised to 300 over the big blind: a full raise of 200
  const raised = round(
    [
      { bet: 300, stack: 700, actedAt: 300 },
      { bet: 100, stack: 900 },
    ],
    { toAct: 1, currentBet: 300, minRaise: 200 }
  );
  assertMatchObject(allowedBets(raised), {
    call: 300,
    raise: { min: 500, max: 1000 },
  });
});

it("caps the call at everything the player has", () => {
  const facingBigBet = round(
    [{ bet: 2000, stack: 0, actedAt: 2000 }, { stack: 600 }, {}],
    { currentBet: 2000, minRaise: 2000 }
  );
  assertMatchObject(allowedBets(facingBigBet), {
    call: 600,
    raise: null,
    noRaise: "You don't have enough chips to raise",
  });
});

it("allows an all-in for less than a minimum raise", () => {
  const short = round(
    [{ bet: 300, actedAt: 300 }, { bet: 100, stack: 300 }, {}],
    { currentBet: 300, minRaise: 200 }
  );
  assert.deepEqual(allowedBets(short)?.raise, { min: 400, max: 400 });
});

it("doesn't allow raising when everyone else is all-in", () => {
  const againstAllIn = round([{ bet: 500, stack: 0 }, { bet: 100 }], {
    currentBet: 500,
  });
  assertMatchObject(allowedBets(againstAllIn), {
    call: 500,
    raise: null,
    noRaise: "Everyone else is all-in",
  });
});

describe("an all-in for less than a full raise", () => {
  // seat 0 bet 100; seat 1 went all-in for 150, half a raise
  const shortAllIn = {
    seats: [
      { bet: 100, stack: 900, actedAt: 100 },
      { bet: 150, stack: 0, actedAt: 150 },
      {},
    ],
    fields: { toAct: 2, currentBet: 150, minRaise: 100 },
  };

  it("doesn't reopen the betting for a player who already acted", () => {
    const backToSeat0 = round(shortAllIn.seats, {
      ...shortAllIn.fields,
      toAct: 0,
    });
    assertMatchObject(allowedBets(backToSeat0), {
      call: 150,
      raise: null,
      noRaise:
        "The betting wasn't reopened by a full raise; you can only call or fold",
    });
  });

  it("lets a player who hasn't acted raise", () => {
    assert.deepEqual(
      allowedBets(round(shortAllIn.seats, shortAllIn.fields))?.raise,
      { min: 250, max: 1000 }
    );
  });

  it("reopens the betting once the short all-ins add up to a full raise", () => {
    // seat 2 went all-in for 200, another half raise, and seat 3 called:
    // seat 0 faces 100 more
    const twoShortAllIns = round(
      [
        { bet: 100, stack: 900, actedAt: 100 },
        { bet: 150, stack: 0, actedAt: 150 },
        { bet: 200, stack: 0, actedAt: 200 },
        { bet: 200, actedAt: 200 },
      ],
      { toAct: 0, currentBet: 200, minRaise: 100 }
    );
    assert.deepEqual(allowedBets(twoShortAllIns)?.raise, {
      min: 300,
      max: 1000,
    });
  });
});

it("gives the big blind the option to raise before the flop", () => {
  const limped = round(
    [{ bet: 100, actedAt: 100 }, { bet: 100, actedAt: 100 }, { bet: 100 }],
    { toAct: 2, currentBet: 100 }
  );
  assertMatchObject(allowedBets(limped), {
    call: 100,
    raise: { min: 200, max: 1100 },
  });
});

it("asks the last player only to call what the all-in players bet", () => {
  // the big blind is all-in for 60 of 100; the small blind has 50 in
  const shortBigBlind = round(
    [{ folded: true }, { bet: 50, stack: 950 }, { bet: 60, stack: 0 }],
    { currentBet: 100 }
  );
  assertMatchObject(allowedBets(shortBigBlind), { call: 60, raise: null });
});

it("has nothing to allow when the round is over", () => {
  assert.equal(allowedBets(round([{}, {}], { toAct: null })), null);
});
