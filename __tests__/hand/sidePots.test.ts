/**
 * Side pots in whole hands, played from fixed decks with the buttons players
 * click: several all-ins of different sizes, each pot won by someone else;
 * a player who put chips into a side pot and then folded; a tie in a side
 * pot with an odd chip; a tie in the main pot; and a big blind all-in for
 * less than a big blind. Every hand ends with the chips conserved.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { applyHandAction } from "../../src/hand/applyHandAction.js";
import type { Draw } from "../../src/hand/Draw.js";
import type { Hand } from "../../src/hand/Hand.js";
import { startHand } from "../../src/hand/startHand.js";
import { translateUiAction } from "../../src/ui/translateUiAction.js";
import type { UiAction } from "../../src/ui/UiAction.js";
import { deck, players } from "../helpers/hand.js";

const blinds = { small: 50, big: 100 };

/** Clicks the buttons in order, failing on any the rules refuse */
const click = (hand: Hand, draw: Draw, ...buttons: UiAction[]): Hand =>
  buttons.reduce((current, button) => {
    const action = translateUiAction(current.betting, button);
    if (typeof action === "string") throw new Error(action);
    return applyHandAction(current, action, draw);
  }, hand);

const fold: UiAction = { type: "fold" };
const check: UiAction = { type: "check" };
const call: UiAction = { type: "call" };
const allIn: UiAction = { type: "allIn" };
const raise = (to: number): UiAction => ({ type: "raise", to });

const stacks = (hand: Hand) => hand.betting.seats.map((seat) => seat.stack);
const total = (numbers: number[]) => numbers.reduce((sum, n) => sum + n, 0);

// No straight, flush or pair on the board, so pocket pairs rank by their rank
const BOARD = "2c7d9h3s4c";

it("pays the main pot and two side pots each to a different player", () => {
  // seat 1 has the button; seat 2 the small blind, seat 3 the big blind
  const start = [1000, 300, 600, 1000];
  const draw = deck(["JdJc", "AhAs", "KdKc", "QhQs"], 0, BOARD);
  let hand = startHand(players(...start), 0, blinds, draw);

  // seat 4 goes all-in, seat 1 calls with everything, the blinds go all-in
  hand = click(hand, draw, allIn, call, allIn, allIn);

  assert.deepEqual(hand.board, BOARD.match(/../g));
  assert.deepEqual(hand.result?.awards, [
    [{ seat: 2, amount: 1200 }], // 300 from each of the four
    [{ seat: 3, amount: 900 }], // 300 more from seats 1, 3 and 4
    [{ seat: 4, amount: 800 }], // 400 more from seats 1 and 4
  ]);
  assert.deepEqual(stacks(hand), [0, 1200, 900, 800]);
  assert.equal(total(stacks(hand)), total(start));
});

it("gives a side pot to the only player left in it when the other folds, whatever their cards", () => {
  // seat 1 has the button and acts first; seat 2 has the small blind
  const start = [2000, 300, 2000];
  const draw = deck(["KdKc", "AhAs", "7c2d"], 0, "Kh9s4dQc3h");
  let hand = startHand(players(...start), 0, blinds, draw);

  // pre-flop: seat 1 raises, seat 2 goes all-in for 300, seat 3 calls
  hand = click(hand, draw, raise(400), allIn, call);
  assert.equal(hand.bettingRound, "flop");
  // on the flop, seat 3 bets and seat 1 folds the best hand of the two
  hand = click(hand, draw, raise(500), fold);

  assert.deepEqual(hand.board, ["Kh", "9s", "4d", "Qc", "3h"]);
  assert.deepEqual(
    hand.result?.shown.map((shown) => shown.seat),
    [2, 3]
  );
  assert.deepEqual(hand.result?.awards, [
    [{ seat: 2, amount: 900 }], // 300 from each
    [{ seat: 3, amount: 200 }], // 100 more from seats 1 and 3; seat 1 folded
  ]);
  // seat 3's bet on the flop came back uncalled
  assert.deepEqual(stacks(hand), [1600, 900, 1800]);
  assert.equal(total(stacks(hand)), total(start));
});

it("splits a side pot on a tie, the odd chip to the first winner left of the button", () => {
  const start = [401, 300, 401, 401];
  const draw = deck(["KhKs", "AhAs", "KdKc", "QhQs"], 0, BOARD);
  let hand = startHand(players(...start), 0, blinds, draw);

  hand = click(hand, draw, allIn, call, allIn, call);

  assert.deepEqual(hand.result?.awards, [
    [{ seat: 2, amount: 1200 }],
    // 101 from each of seats 1, 3 and 4: 303, split between the two kings
    [
      { seat: 3, amount: 152 },
      { seat: 1, amount: 151 },
    ],
  ]);
  assert.deepEqual(stacks(hand), [151, 1200, 152, 0]);
  assert.equal(total(stacks(hand)), total(start));
});

it("splits the main pot on a tie, while the side pot has one winner", () => {
  const start = [1000, 300, 1000];
  const draw = deck(["AdAc", "AhAs", "KhKs"], 0, BOARD);
  let hand = startHand(players(...start), 0, blinds, draw);

  hand = click(hand, draw, allIn, allIn, call);

  assert.deepEqual(hand.result?.awards, [
    [
      { seat: 2, amount: 450 },
      { seat: 1, amount: 450 },
    ],
    [{ seat: 1, amount: 1400 }], // 700 more from seats 1 and 3
  ]);
  assert.deepEqual(stacks(hand), [1850, 450, 0]);
  assert.equal(total(stacks(hand)), total(start));
});

it("makes a side pot above a big blind that's all-in for less than a big blind", () => {
  // seat 3 posts 60 of the big blind, all it has
  const start = [1000, 1000, 60];
  const draw = deck(["KdKc", "QhQs", "AhAs"], 0, BOARD);
  let hand = startHand(players(...start), 0, blinds, draw);

  hand = click(hand, draw, call, call);
  assert.equal(hand.bettingRound, "flop");
  hand = click(hand, draw, check, check, check, check, check, check);

  assert.deepEqual(hand.result?.awards, [
    [{ seat: 3, amount: 180 }], // 60 from each
    [{ seat: 1, amount: 80 }], // 40 more from seats 1 and 2
  ]);
  assert.deepEqual(stacks(hand), [980, 900, 180]);
  assert.equal(total(stacks(hand)), total(start));
});
