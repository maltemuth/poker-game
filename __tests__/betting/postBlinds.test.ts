/**
 * Tests for posting the blinds: who posts, how much, short stacks, heads-up,
 * and who acts first.
 */

import { postBlinds } from "../../src/betting/postBlinds.js";
import { chips } from "../helpers/betting.js";

const blinds = { small: 50, big: 100 };
const players = (...stacks: number[]) =>
  stacks.map((stack, index) => ({ seat: index + 1, stack }));

it("posts the blinds left of the button, and the next player acts first", () => {
  const round = postBlinds(players(1000, 1000, 1000, 1000), 0, blinds);
  expect(round.seats.map((seat) => seat.bet)).toEqual([0, 50, 100, 0]);
  expect(round.seats.map((seat) => seat.stack)).toEqual([1000, 950, 900, 1000]);
  expect(round.toAct).toBe(3);
  expect(round.currentBet).toBe(100);
  expect(round.minRaise).toBe(100);
});

it("wraps around the table", () => {
  const round = postBlinds(players(1000, 1000, 1000), 1, blinds);
  expect(round.seats.map((seat) => seat.bet)).toEqual([100, 0, 50]);
  // three-handed, the button acts first
  expect(round.toAct).toBe(1);
});

it("has the button post the small blind and act first heads-up", () => {
  const round = postBlinds(players(1000, 1000), 1, blinds);
  expect(round.seats.map((seat) => seat.bet)).toEqual([100, 50]);
  expect(round.toAct).toBe(1);
});

it("counts posting a blind as having bet, but not as having acted", () => {
  const round = postBlinds(players(1000, 1000, 1000), 0, blinds);
  expect(round.seats.map((seat) => seat.committed)).toEqual([0, 50, 100]);
  expect(round.seats.every((seat) => seat.actedAt === null)).toBe(true);
});

it("puts a player who can't cover a blind all-in, and keeps the full big blind to call", () => {
  const round = postBlinds(players(1000, 30, 60), 0, blinds);
  expect(round.seats.map((seat) => seat.bet)).toEqual([0, 30, 60]);
  expect(round.seats.map((seat) => seat.stack)).toEqual([1000, 0, 0]);
  expect(round.currentBet).toBe(100);
  expect(round.toAct).toBe(0);
});

it("starts with no one to act when the blinds leave nothing to call", () => {
  // heads-up, the button's small blind of 50 covers the big blind's all-in 40
  const covered = postBlinds(players(1000, 40), 0, blinds);
  expect(covered.toAct).toBeNull();

  // both blinds all-in
  const bothAllIn = postBlinds(players(60, 30), 1, blinds);
  expect(bothAllIn.seats.map((seat) => seat.stack)).toEqual([0, 0]);
  expect(bothAllIn.toAct).toBeNull();
});

it("asks the small blind to call a short big blind it doesn't cover", () => {
  // heads-up, the big blind is all-in for 80, more than the small blind of 50
  const round = postBlinds(players(1000, 80), 0, blinds);
  expect(round.toAct).toBe(0);
});

it("conserves chips", () => {
  const stacks = [1000, 30, 60, 2500];
  const round = postBlinds(players(...stacks), 0, blinds);
  expect(chips(round)).toBe(stacks.reduce((sum, stack) => sum + stack));
});

it("refuses hands that the table should never deal", () => {
  expect(() => postBlinds(players(1000), 0, blinds)).toThrow(
    "A hand needs two players"
  );
  expect(() => postBlinds(players(1000, 0), 0, blinds)).toThrow(
    "Every player dealt in needs chips"
  );
});
