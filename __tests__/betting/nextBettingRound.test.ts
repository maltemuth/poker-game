/**
 * Tests for starting the next betting round: bets cleared but still
 * committed, who acts first, and rounds without betting.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { nextBettingRound } from "../../src/betting/nextBettingRound.js";
import { chips, round } from "../helpers/betting.js";

// the pre-flop round is over: everyone has 300 in, seat 1 folded
const preFlopOver = round(
  [
    { bet: 300, stack: 700, actedAt: 300 },
    { bet: 100, committed: 100, stack: 900, folded: true, actedAt: 300 },
    { bet: 300, stack: 700, actedAt: 300 },
    { bet: 300, stack: 700, actedAt: 300 },
  ],
  { button: 3, toAct: null, currentBet: 300, minRaise: 200 }
);

it("clears the bets but keeps what each seat committed", () => {
  const flop = nextBettingRound(preFlopOver);
  assert.deepEqual(
    flop.seats.map((seat) => seat.bet),
    [0, 0, 0, 0]
  );
  assert.deepEqual(
    flop.seats.map((seat) => seat.committed),
    [300, 100, 300, 300]
  );
  assert.equal(
    flop.seats.every((seat) => seat.actedAt === null),
    true
  );
  assert.equal(chips(flop), chips(preFlopOver));
});

it("starts with no bet and a minimum bet of the big blind", () => {
  const flop = nextBettingRound(preFlopOver);
  assert.equal(flop.currentBet, 0);
  assert.equal(flop.minRaise, 100);
});

it("has the first player left of the button act, skipping folded seats", () => {
  assert.equal(nextBettingRound(preFlopOver).toAct, 0);
  assert.equal(nextBettingRound({ ...preFlopOver, button: 0 }).toAct, 2);
});

it("has the big blind act first heads-up", () => {
  // the button, seat 0, posted the small blind
  const headsUp = round(
    [
      { bet: 100, stack: 900, actedAt: 100 },
      { bet: 100, stack: 900, actedAt: 100 },
    ],
    { button: 0, toAct: null, currentBet: 100 }
  );
  assert.equal(nextBettingRound(headsUp).toAct, 1);
});

it("has no one act when at most one player can", () => {
  const allIn = round(
    [
      { bet: 1000, stack: 0, actedAt: 1000 },
      { bet: 1000, stack: 500, actedAt: 1000 },
    ],
    { toAct: null, currentBet: 1000 }
  );
  assert.equal(nextBettingRound(allIn).toAct, null);
});

it("refuses while the round is still on, or the hand is over", () => {
  assert.throws(() => nextBettingRound({ ...preFlopOver, toAct: 0 }), {
    message: "The betting round isn't over",
  });
  const foldedToOne = round([{}, { folded: true }], { toAct: null });
  assert.throws(() => nextBettingRound(foldedToOne), {
    message: "Only one player is left in the hand",
  });
});
