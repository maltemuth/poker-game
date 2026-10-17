/**
 * Tests for collecting the bets at the end of a betting round, and for the
 * next betting round collecting them itself.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { assertMatchObject } from "../helpers/assert.js";
import { nextBettingRound } from "../../src/betting/nextBettingRound.js";
import { collectBets } from "../../src/pots/collectBets.js";
import { chips, round } from "../helpers/betting.js";

// seat 1 is all-in for 200; seat 2 bet 600, which seat 3 called
const allInCalled = round(
  [
    { bet: 200, stack: 0, actedAt: 200 },
    { bet: 600, stack: 400, actedAt: 600 },
    { bet: 600, stack: 400, actedAt: 600 },
  ],
  { toAct: null, currentBet: 600, minRaise: 400 }
);

it("moves the bets into the pots, with a side pot above the all-in", () => {
  const collected = collectBets(allInCalled);
  assert.deepEqual(
    collected.seats.map((seat) => seat.bet),
    [0, 0, 0]
  );
  assert.equal(collected.currentBet, 0);
  assert.deepEqual(collected.pots, [
    { amount: 600, seats: [1, 2, 3] },
    { amount: 800, seats: [2, 3] },
  ]);
});

it("returns the uncalled bet before computing the pots", () => {
  // seat 2's bet of 600 is called only by seat 1's all-in for 200
  const shortCall = round(
    [
      { bet: 200, stack: 0, actedAt: 200 },
      { bet: 600, stack: 400, actedAt: 600 },
      { bet: 100, folded: true },
    ],
    { toAct: null, currentBet: 600 }
  );
  const collected = collectBets(shortCall);
  assertMatchObject(collected.seats[1], { stack: 800, committed: 200 });
  assert.deepEqual(collected.pots, [{ amount: 500, seats: [1, 2] }]);
});

it("computes the pots from the whole hand, so collecting twice changes nothing", () => {
  const once = collectBets(allInCalled);
  assert.deepEqual(collectBets(once), once);
});

it("keeps the chips: stacks plus pots add up to what there was", () => {
  const collected = collectBets(allInCalled);
  const inPots = collected.pots.reduce((sum, pot) => sum + pot.amount, 0);
  const inStacks = collected.seats.reduce((sum, seat) => sum + seat.stack, 0);
  assert.equal(inPots + inStacks, chips(allInCalled));
});

it("refuses while the round is still on", () => {
  assert.throws(() => collectBets({ ...allInCalled, toAct: 2 }), {
    message: "The betting round isn't over",
  });
});

it("is done by the next betting round", () => {
  const flop = nextBettingRound(allInCalled);
  assert.deepEqual(flop.pots, collectBets(allInCalled).pots);
  assert.deepEqual(
    flop.seats.map((seat) => seat.bet),
    [0, 0, 0]
  );
});
