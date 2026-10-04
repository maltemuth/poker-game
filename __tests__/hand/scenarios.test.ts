/**
 * Whole hands with cards: a scripted hand from a fixed deck, played with the
 * buttons players click, and random hands with a seeded draw, checking that
 * every hand ends, no card is dealt twice, and the chips are conserved.
 */

import { isInHand } from "../../src/betting/seatStatus.js";
import { applyHandAction } from "../../src/hand/applyHandAction.js";
import type { Draw } from "../../src/hand/Draw.js";
import type { Hand } from "../../src/hand/Hand.js";
import { startHand } from "../../src/hand/startHand.js";
import { availableUiActions } from "../../src/ui/availableUiActions.js";
import { translateUiAction } from "../../src/ui/translateUiAction.js";
import type { UiAction } from "../../src/ui/UiAction.js";
import { deck, players } from "../helpers/hand.js";
import { random } from "../helpers/random.js";

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

it("plays a three-way hand with a side pot to showdown", () => {
  // seat 1 has the button; seat 2 the small blind, seat 3 the big blind
  const draw = deck(["AhAs", "KdKc", "7c2d"], 0, "Kh9s4dQc3h");
  let hand = startHand(players(2000, 600, 2000), 0, blinds, draw);

  // pre-flop: seat 1 raises, seat 2 goes all-in for 600, seat 3 folds, seat 1 calls
  hand = click(hand, draw, raise(300), allIn, fold, call);
  expect(hand.board).toEqual(["Kh", "9s", "4d", "Qc", "3h"]);

  // no one left could bet against each other, so the board was dealt out
  expect(hand.result?.shown.map((shown) => [shown.seat, shown.type])).toEqual([
    [1, "pair"],
    [2, "threeOfAKind"],
  ]);
  // seat 2's kings win the main pot: 600 each from seats 1 and 2, 100 from seat 3
  expect(hand.result?.awards).toEqual([[{ seat: 2, amount: 1300 }]]);
  expect(hand.betting.seats.map((seat) => seat.stack)).toEqual([
    1400, 1300, 1900,
  ]);
});

it("ends with the last player when everyone else folds on the flop", () => {
  const draw = deck(["AhAs", "KdKc", "7c2d"], 0, "Kh9s4d");
  let hand = startHand(players(1000, 1000, 1000), 0, blinds, draw);
  hand = click(hand, draw, call, call, check);
  expect(hand.bettingRound).toBe("flop");
  hand = click(hand, draw, raise(200), fold, fold);
  expect(hand.result?.shown).toEqual([]);
  // 300 from before the flop; the bet of 200 came back uncalled
  expect(hand.result?.awards).toEqual([[{ seat: 2, amount: 300 }]]);
});

/** Draws from the cards still out with the seeded generator */
const seededDraw =
  (next: () => number): Draw =>
  (out) =>
    out[Math.floor(next() * out.length)];

it("ends every random hand, with each card dealt once and the chips conserved", () => {
  for (let game = 0; game < 300; game++) {
    const next = random(game);
    const draw = seededDraw(next);
    const count = 2 + Math.floor(next() * 8);
    const stacks = Array.from(
      { length: count },
      () => 1 + Math.floor(next() * 3000)
    );
    const total = stacks.reduce((sum, stack) => sum + stack);
    let hand = startHand(players(...stacks), game % count, blinds, draw);

    for (let step = 0; hand.result === null; step++) {
      expect(step).toBeLessThan(count * 200);
      const options = availableUiActions(hand.betting);
      const option = options[Math.floor(next() * options.length)];
      const button: UiAction =
        option.type === "raise"
          ? {
              type: "raise",
              to:
                option.min + Math.floor(next() * (option.max - option.min + 1)),
            }
          : { type: option.type };
      hand = click(hand, draw, button);
    }

    const dealt = [...hand.holeCards.flat(), ...hand.board];
    expect(new Set(dealt).size).toBe(dealt.length);
    expect(hand.betting.seats.reduce((sum, s) => sum + s.stack, 0)).toBe(total);
    // a showdown has the whole board, and shows the hands still in
    const showdown = hand.betting.seats.filter(isInHand).length > 1;
    if (showdown) expect(hand.board).toHaveLength(5);
    expect((hand.result?.shown.length ?? 0) > 0).toBe(showdown);
  }
});
