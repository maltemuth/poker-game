/**
 * Tests for returning the part of a bet no one called.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { assertMatchObject } from "../helpers/assert.js";
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
  assertMatchObject(returned, { stack: 900, bet: 100, committed: 100 });
});

it("returns what a short all-in call didn't cover", () => {
  const seats = [
    seat(0, { bet: 800, stack: 200 }),
    seat(1, { bet: 350, stack: 0 }),
  ];
  assertMatchObject(returnUncalledBet(seats)[0], {
    stack: 650,
    bet: 350,
    committed: 350,
  });
});

it("counts earlier betting rounds in the totals", () => {
  // both put in 500 before; now seat 1 bets 200 and seat 2 folds
  const seats = [
    seat(0, { bet: 200, committed: 700, stack: 300 }),
    seat(1, { bet: 0, committed: 500, folded: true }),
  ];
  assertMatchObject(returnUncalledBet(seats)[0], {
    stack: 500,
    bet: 0,
    committed: 500,
  });
});

it("returns nothing to a player who folded, out of turn", () => {
  // heads-up: the big blind folded before the small blind acted
  const seats = [
    seat(0, { bet: 50, stack: 950 }),
    seat(1, { bet: 100, stack: 900, folded: true }),
  ];
  assert.equal(returnUncalledBet(seats), seats);
});

it("returns nothing when the highest total was matched", () => {
  const seats = [seat(0, { bet: 400 }), seat(1, { bet: 400 }), seat(2)];
  assert.equal(returnUncalledBet(seats), seats);
});

it("refuses an uncalled part beyond this betting round's bet", () => {
  const seats = [
    seat(0, { bet: 0, committed: 700 }),
    seat(1, { bet: 0, committed: 500 }),
  ];
  assert.throws(() => returnUncalledBet(seats), {
    message: "An uncalled bet from an earlier betting round wasn't returned",
  });
});
