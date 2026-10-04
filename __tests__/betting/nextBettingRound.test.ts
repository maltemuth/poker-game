/**
 * Tests for starting the next betting round: bets cleared but still
 * committed, who acts first, and rounds without betting.
 */

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
  expect(flop.seats.map((seat) => seat.bet)).toEqual([0, 0, 0, 0]);
  expect(flop.seats.map((seat) => seat.committed)).toEqual([
    300, 100, 300, 300,
  ]);
  expect(flop.seats.every((seat) => seat.actedAt === null)).toBe(true);
  expect(chips(flop)).toBe(chips(preFlopOver));
});

it("starts with no bet and a minimum bet of the big blind", () => {
  const flop = nextBettingRound(preFlopOver);
  expect(flop.currentBet).toBe(0);
  expect(flop.minRaise).toBe(100);
});

it("has the first player left of the button act, skipping folded seats", () => {
  expect(nextBettingRound(preFlopOver).toAct).toBe(0);
  expect(nextBettingRound({ ...preFlopOver, button: 0 }).toAct).toBe(2);
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
  expect(nextBettingRound(headsUp).toAct).toBe(1);
});

it("has no one act when at most one player can", () => {
  const allIn = round(
    [
      { bet: 1000, stack: 0, actedAt: 1000 },
      { bet: 1000, stack: 500, actedAt: 1000 },
    ],
    { toAct: null, currentBet: 1000 }
  );
  expect(nextBettingRound(allIn).toAct).toBeNull();
});

it("refuses while the round is still on, or the hand is over", () => {
  expect(() => nextBettingRound({ ...preFlopOver, toAct: 0 })).toThrow(
    "The betting round isn't over"
  );
  const foldedToOne = round([{}, { folded: true }], { toAct: null });
  expect(() => nextBettingRound(foldedToOne)).toThrow(
    "Only one player is left in the hand"
  );
});
