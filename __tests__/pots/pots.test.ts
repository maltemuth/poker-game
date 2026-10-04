/**
 * Tests for computing the main pot and side pots from what each seat put
 * into the hand.
 */

import { pots } from "../../src/pots/pots.js";
import { seat } from "../helpers/betting.js";

const committed = (...amounts: number[]) =>
  amounts.map((amount, index) => seat(index, { committed: amount }));

it("makes one pot when everyone put in the same", () => {
  expect(pots(committed(300, 300, 300))).toEqual([
    { amount: 900, seats: [1, 2, 3] },
  ]);
});

it("makes a side pot above a short all-in", () => {
  // seat 1 is all-in for 100; seats 2 and 3 put in 400 each
  expect(pots(committed(100, 400, 400))).toEqual([
    { amount: 300, seats: [1, 2, 3] },
    { amount: 600, seats: [2, 3] },
  ]);
});

it("makes a side pot for every different all-in", () => {
  expect(pots(committed(100, 250, 600, 600))).toEqual([
    { amount: 400, seats: [1, 2, 3, 4] },
    { amount: 450, seats: [2, 3, 4] },
    { amount: 700, seats: [3, 4] },
  ]);
});

it("keeps folded seats' chips in the pots, without letting them win", () => {
  const seats = committed(100, 400, 400, 250);
  seats[3] = { ...seats[3], folded: true };
  expect(pots(seats)).toEqual([
    { amount: 400, seats: [1, 2, 3] },
    { amount: 750, seats: [2, 3] },
  ]);
});

it("puts a folded seat's chips above every level into the last pot", () => {
  // seat 3 put in 500 and folded; the players still in have 100 and 300
  const seats = committed(100, 300, 500);
  seats[2] = { ...seats[2], folded: true };
  expect(pots(seats)).toEqual([
    { amount: 300, seats: [1, 2] },
    { amount: 600, seats: [2] },
  ]);
});

it("gives everything to the last seat in the hand", () => {
  const seats = committed(50, 100, 300);
  seats[0] = { ...seats[0], folded: true };
  seats[1] = { ...seats[1], folded: true };
  expect(pots(seats)).toEqual([{ amount: 450, seats: [3] }]);
});

it("adds up to everything put in", () => {
  const seats = committed(35, 800, 120, 800, 1200, 0);
  seats[4] = { ...seats[4], folded: true };
  const total = seats.reduce((sum, s) => sum + s.committed, 0);
  expect(pots(seats).reduce((sum, pot) => sum + pot.amount, 0)).toBe(total);
});

it("makes no pots when nothing was put in", () => {
  expect(pots(committed(0, 0))).toEqual([]);
});
