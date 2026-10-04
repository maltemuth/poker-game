/**
 * Tests for moving a hand on: dealing the flop, turn and river as betting
 * rounds end, passing through rounds without betting, and ending the hand.
 */

import { applyAction } from "../../src/betting/applyAction.js";
import { continueHand } from "../../src/hand/continueHand.js";
import type { Hand } from "../../src/hand/Hand.js";
import { fixedDraw } from "../../src/hand/fixedDraw.js";
import { round } from "../helpers/betting.js";

const holeCards = [
  ["Ah", "As"],
  ["Kd", "Kc"],
];

const preFlopOver: Hand = {
  betting: round(
    [
      { bet: 100, stack: 900, actedAt: 100 },
      { bet: 100, stack: 900, actedAt: 100 },
    ],
    { toAct: null, currentBet: 100 }
  ),
  holeCards,
  board: [],
  bettingRound: "preFlop",
  result: null,
  turn: 0,
  tabled: false,
  pacedRunout: false,
};

it("deals the flop and starts its betting round", () => {
  const flop = continueHand(preFlopOver, fixedDraw(["2c", "7d", "9h"]));
  expect(flop.board).toEqual(["2c", "7d", "9h"]);
  expect(flop.bettingRound).toBe("flop");
  expect(flop.betting.toAct).toBe(1);
  expect(flop.betting.pots).toEqual([{ amount: 200, seats: [1, 2] }]);
});

it("does nothing while someone is to act", () => {
  const playing = {
    ...preFlopOver,
    betting: { ...preFlopOver.betting, toAct: 0 },
  };
  expect(continueHand(playing, fixedDraw([]))).toBe(playing);
});

it("deals the turn and the river one card each", () => {
  const draw = fixedDraw(["2c", "7d", "9h", "Js", "3c"]);
  let hand = continueHand(preFlopOver, draw);
  for (const name of ["turn", "river"]) {
    // both check
    hand = {
      ...hand,
      betting: [0, 0].reduce(
        (betting) => applyAction(betting, { type: "bet", to: 0 }),
        hand.betting
      ),
    };
    hand = continueHand(hand, draw);
    expect(hand.bettingRound).toBe(name);
  }
  expect(hand.board).toEqual(["2c", "7d", "9h", "Js", "3c"]);
});

it("deals out the board and ends the hand when everyone is all-in", () => {
  const allIn: Hand = {
    ...preFlopOver,
    betting: round(
      [
        { bet: 1000, stack: 0, actedAt: 1000 },
        { bet: 1000, stack: 0, actedAt: 1000 },
      ],
      { toAct: null, currentBet: 1000 }
    ),
  };
  const done = continueHand(allIn, fixedDraw(["2c", "7d", "9h", "Js", "3c"]));
  expect(done.board).toHaveLength(5);
  expect(done.bettingRound).toBe("river");
  expect(done.result?.awards).toEqual([[{ seat: 1, amount: 2000 }]]);
});

it("ends the hand without dealing when only one player is left", () => {
  const folded: Hand = {
    ...preFlopOver,
    betting: round(
      [
        { bet: 100, stack: 900 },
        { bet: 50, stack: 950, folded: true },
      ],
      { toAct: null, currentBet: 100 }
    ),
  };
  const done = continueHand(folded, fixedDraw([]));
  expect(done.board).toEqual([]);
  expect(done.result?.shown).toEqual([]);
});
