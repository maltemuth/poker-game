/**
 * Tests for returning the part of a bet no one called.
 */

import { returnUncalledBet } from "../../src/pots/uncalledBet.js";
import { seat } from "../helpers/betting.js";

it("returns a bet everyone folded to, down to what the others put in", () => {
  // seat 3 raised to 300; the blinds folded
  const seats = [
    seat(0, { bet: 50, folded: true }),
    seat(1, { bet: 100, folded: true }),
    seat(2, { bet: 300, stack: 700 }),
  ];
  const returned = returnUncalledBet(seats)[2];
  expect(returned).toMatchObject({ stack: 900, bet: 100, committed: 100 });
});

it("returns what a short all-in call didn't cover", () => {
  const seats = [
    seat(0, { bet: 800, stack: 200 }),
    seat(1, { bet: 350, stack: 0 }),
  ];
  expect(returnUncalledBet(seats)[0]).toMatchObject({
    stack: 650,
    bet: 350,
    committed: 350,
  });
});

it("counts earlier streets in the totals", () => {
  // both put in 500 before; now seat 1 bets 200 and seat 2 folds
  const seats = [
    seat(0, { bet: 200, committed: 700, stack: 300 }),
    seat(1, { bet: 0, committed: 500, folded: true }),
  ];
  expect(returnUncalledBet(seats)[0]).toMatchObject({
    stack: 500,
    bet: 0,
    committed: 500,
  });
});

it("returns nothing when the highest total was matched", () => {
  const seats = [seat(0, { bet: 400 }), seat(1, { bet: 400 }), seat(2)];
  expect(returnUncalledBet(seats)).toBe(seats);
});

it("refuses an uncalled part beyond this street's bet", () => {
  const seats = [
    seat(0, { bet: 0, committed: 700 }),
    seat(1, { bet: 0, committed: 500 }),
  ];
  expect(() => returnUncalledBet(seats)).toThrow(
    "An uncalled bet from an earlier street wasn't returned"
  );
});
