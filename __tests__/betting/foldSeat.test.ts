/**
 * Tests for folding a seat in or out of turn: the player to act stays, or
 * the round ends when the fold leaves no one to bet against.
 */

import { foldSeat } from "../../src/betting/foldSeat.js";
import { chips, round } from "../helpers/betting.js";

// blinds posted by seats 2 and 3; seat 4 is to act
const blinds = round(
  [{}, { bet: 50, stack: 950 }, { bet: 100, stack: 900 }, {}],
  { toAct: 3, currentBet: 100 }
);

it("folds out of turn, and the player to act stays", () => {
  const folded = foldSeat(blinds, 0);
  expect(folded.seats[0].folded).toBe(true);
  expect(folded.toAct).toBe(3);
  expect(chips(folded)).toBe(chips(blinds));
});

it("folds in turn like an ordinary fold", () => {
  const folded = foldSeat(blinds, 3);
  expect(folded.seats[3]).toMatchObject({ folded: true, actedAt: 100 });
  expect(folded.toAct).toBe(0);
});

it("ends the round when only one player is left", () => {
  const headsUp = round(
    [
      { bet: 50, stack: 950 },
      { bet: 100, stack: 900 },
    ],
    {
      toAct: 0,
      currentBet: 100,
    }
  );
  expect(foldSeat(headsUp, 1).toAct).toBeNull();
});

it("moves on when the player to act no longer must", () => {
  // seat 1 is to act with nothing owed, against seat 2 only; seat 3 is all-in
  const lastOpponent = round([{ bet: 0 }, { bet: 0 }, { stack: 0, bet: 0 }], {
    toAct: 0,
  });
  expect(foldSeat(lastOpponent, 1).toAct).toBeNull();
});

it("refuses a seat that isn't in the hand", () => {
  expect(() => foldSeat(foldSeat(blinds, 0), 0)).toThrow(
    "The seat isn't in the hand"
  );
});
