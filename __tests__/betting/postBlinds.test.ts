/**
 * Tests for posting the blinds: who posts, how much, short stacks, heads-up,
 * and who acts first.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { postBlinds } from "../../src/betting/postBlinds.js";
import { chips } from "../helpers/betting.js";

const blinds = { small: 50, big: 100 };
const players = (...stacks: number[]) =>
  stacks.map((stack, index) => ({ seat: index + 1, stack }));

it("posts the blinds left of the button, and the next player acts first", () => {
  const round = postBlinds(players(1000, 1000, 1000, 1000), 0, blinds);
  assert.deepEqual(
    round.seats.map((seat) => seat.bet),
    [0, 50, 100, 0]
  );
  assert.deepEqual(
    round.seats.map((seat) => seat.stack),
    [1000, 950, 900, 1000]
  );
  assert.equal(round.toAct, 3);
  assert.equal(round.currentBet, 100);
  assert.equal(round.minRaise, 100);
});

it("wraps around the table", () => {
  const round = postBlinds(players(1000, 1000, 1000), 1, blinds);
  assert.deepEqual(
    round.seats.map((seat) => seat.bet),
    [100, 0, 50]
  );
  // three-handed, the button acts first
  assert.equal(round.toAct, 1);
});

it("has the button post the small blind and act first heads-up", () => {
  const round = postBlinds(players(1000, 1000), 1, blinds);
  assert.deepEqual(
    round.seats.map((seat) => seat.bet),
    [100, 50]
  );
  assert.equal(round.toAct, 1);
});

it("counts posting a blind as having bet, but not as having acted", () => {
  const round = postBlinds(players(1000, 1000, 1000), 0, blinds);
  assert.deepEqual(
    round.seats.map((seat) => seat.committed),
    [0, 50, 100]
  );
  assert.equal(
    round.seats.every((seat) => seat.actedAt === null),
    true
  );
});

it("puts a player who can't cover a blind all-in, and keeps the full big blind to call", () => {
  const round = postBlinds(players(1000, 30, 60), 0, blinds);
  assert.deepEqual(
    round.seats.map((seat) => seat.bet),
    [0, 30, 60]
  );
  assert.deepEqual(
    round.seats.map((seat) => seat.stack),
    [1000, 0, 0]
  );
  assert.equal(round.currentBet, 100);
  assert.equal(round.toAct, 0);
});

it("starts with no one to act when the blinds leave nothing to call", () => {
  // heads-up, the button's small blind of 50 covers the big blind's all-in 40
  const covered = postBlinds(players(1000, 40), 0, blinds);
  assert.equal(covered.toAct, null);

  // both blinds all-in
  const bothAllIn = postBlinds(players(60, 30), 1, blinds);
  assert.deepEqual(
    bothAllIn.seats.map((seat) => seat.stack),
    [0, 0]
  );
  assert.equal(bothAllIn.toAct, null);
});

it("asks the small blind to call a short big blind it doesn't cover", () => {
  // heads-up, the big blind is all-in for 80, more than the small blind of 50
  const round = postBlinds(players(1000, 80), 0, blinds);
  assert.equal(round.toAct, 0);
});

it("conserves chips", () => {
  const stacks = [1000, 30, 60, 2500];
  const round = postBlinds(players(...stacks), 0, blinds);
  assert.equal(
    chips(round),
    stacks.reduce((sum, stack) => sum + stack)
  );
});

it("refuses hands that the table should never deal", () => {
  assert.throws(() => postBlinds(players(1000), 0, blinds), {
    message: "A hand needs two players",
  });
  assert.throws(() => postBlinds(players(1000, 0), 0, blinds), {
    message: "Every player dealt in needs chips",
  });
});

describe("extra big blinds from new players", () => {
  it("posts a live big blind, and the poster still gets to act", () => {
    // seat 4 is new and posts a big blind; seat 1 acts first after the big blind
    const round = postBlinds(
      players(1000, 1000, 1000, 1000, 1000),
      0,
      blinds,
      [3]
    );
    assert.deepEqual(
      round.seats.map((seat) => seat.bet),
      [0, 50, 100, 100, 0]
    );
    assert.equal(round.currentBet, 100);
    assert.equal(round.toAct, 3);
    assert.equal(round.seats[3].actedAt, null);
  });

  it("refuses an extra big blind from a blind", () => {
    assert.throws(() => postBlinds(players(1000, 1000, 1000), 0, blinds, [1]), {
      message: "The blinds don't post an extra big blind",
    });
  });
});
