/**
 * Tests for collecting the bets at the end of a betting round, and for the
 * next street collecting them itself.
 */

import { nextStreet } from "../../src/betting/nextStreet.js";
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
  expect(collected.seats.map((seat) => seat.bet)).toEqual([0, 0, 0]);
  expect(collected.currentBet).toBe(0);
  expect(collected.pots).toEqual([
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
  expect(collected.seats[1]).toMatchObject({ stack: 800, committed: 200 });
  expect(collected.pots).toEqual([{ amount: 500, seats: [1, 2] }]);
});

it("computes the pots from the whole hand, so collecting twice changes nothing", () => {
  const once = collectBets(allInCalled);
  expect(collectBets(once)).toEqual(once);
});

it("keeps the chips: stacks plus pots add up to what there was", () => {
  const collected = collectBets(allInCalled);
  const inPots = collected.pots.reduce((sum, pot) => sum + pot.amount, 0);
  const inStacks = collected.seats.reduce((sum, seat) => sum + seat.stack, 0);
  expect(inPots + inStacks).toBe(chips(allInCalled));
});

it("refuses while the round is still on", () => {
  expect(() => collectBets({ ...allInCalled, toAct: 2 })).toThrow(
    "The betting round isn't over"
  );
});

it("is done by the next street", () => {
  const flop = nextStreet(allInCalled);
  expect(flop.pots).toEqual(collectBets(allInCalled).pots);
  expect(flop.seats.map((seat) => seat.bet)).toEqual([0, 0, 0]);
});
