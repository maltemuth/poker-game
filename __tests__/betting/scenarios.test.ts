/**
 * Betting through whole hands, the way the hand layer will drive it: post
 * the blinds, act until the round is over, start the next betting round, award the
 * pots. Scripted hands check known situations; random play checks that chips
 * are conserved, every round comes to an end and every hand is paid out.
 */

import { applyAction } from "../../src/betting/applyAction.js";
import { awardPots } from "../../src/pots/awardPots.js";
import type { BettingRound } from "../../src/betting/BettingRound.js";
import { nextBettingRound } from "../../src/betting/nextBettingRound.js";
import { postBlinds } from "../../src/betting/postBlinds.js";
import { isInHand } from "../../src/betting/seatStatus.js";
import { availableUiActions } from "../../src/ui/availableUiActions.js";
import { translateUiAction } from "../../src/ui/translateUiAction.js";
import type { UiAction } from "../../src/ui/UiAction.js";
import { chips } from "../helpers/betting.js";
import { random } from "../helpers/random.js";

const blinds = { small: 50, big: 100 };
const players = (...stacks: number[]) =>
  stacks.map((stack, index) => ({ seat: index + 1, stack }));

/** Clicks the buttons in order, failing on any the rules refuse */
const click = (round: BettingRound, ...buttons: UiAction[]): BettingRound =>
  buttons.reduce((current, button) => {
    const action = translateUiAction(current, button);
    if (typeof action === "string") throw new Error(action);
    return applyAction(current, action);
  }, round);

const fold: UiAction = { type: "fold" };
const check: UiAction = { type: "check" };
const call: UiAction = { type: "call" };
const allIn: UiAction = { type: "allIn" };
const raise = (to: number): UiAction => ({ type: "raise", to });

it("plays a hand to the river", () => {
  // button seat 1, blinds seats 2 and 3; seat 4 raises, seat 1 and the big blind call
  let round = postBlinds(players(1000, 1000, 1000, 1000), 0, blinds);
  round = click(round, raise(300), call, fold, call);
  expect(round.toAct).toBeNull();
  expect(round.seats.map((seat) => seat.committed)).toEqual([
    300, 50, 300, 300,
  ]);

  // flop: the big blind acts first and bets, both call
  round = nextBettingRound(round);
  expect(round.toAct).toBe(2);
  round = click(round, raise(400), call, call);

  // turn and river: checked through
  round = click(nextBettingRound(round), check, check, check);
  round = click(nextBettingRound(round), check, check, check);
  expect(round.toAct).toBeNull();
  expect(round.seats.map((seat) => seat.committed)).toEqual([
    700, 50, 700, 700,
  ]);
});

it("ends the hand when everyone folds to the big blind", () => {
  const round = click(
    postBlinds(players(1000, 1000, 1000), 0, blinds),
    fold,
    fold
  );
  expect(round.toAct).toBeNull();
  expect(round.seats.filter(isInHand).map((seat) => seat.seat)).toEqual([3]);
});

it("lets a short all-in through without reopening the betting", () => {
  // seat 1 (button) raises to 300; seat 2 goes all-in for 400 total, less
  // than a full raise; seat 3 (big blind) calls; seat 1 may only call or fold
  let round = postBlinds(players(1000, 400, 1000), 0, blinds);
  round = click(round, raise(300), allIn, call);
  expect(round.toAct).toBe(0);
  expect(availableUiActions(round).map((option) => option.type)).toEqual([
    "fold",
    "call",
  ]);
  round = click(round, call);
  expect(round.toAct).toBeNull();
  // two players can still act on the flop
  expect(nextBettingRound(round).toAct).toBe(2);
});

it("deals out without betting once everyone is all-in", () => {
  let round = postBlinds(players(500, 800), 0, blinds);
  round = click(round, allIn, call);
  expect(round.toAct).toBeNull();
  for (let count = 0; count < 3; count++) {
    round = nextBettingRound(round);
    expect(round.toAct).toBeNull();
  }
});

/** A random button from the ones offered, with a random raise in the range */
const randomButton = (round: BettingRound, next: () => number): UiAction => {
  const options = availableUiActions(round);
  const option = options[Math.floor(next() * options.length)];
  if (option.type !== "raise") return { type: option.type };
  return {
    type: "raise",
    to: option.min + Math.floor(next() * (option.max - option.min + 1)),
  };
};

/** Every chip: stacks, bets in front of the players, and the pots */
const onTable = (round: BettingRound): number =>
  round.seats.reduce((sum, seat) => sum + seat.stack + seat.bet, 0) +
  round.pots.reduce((sum, pot) => sum + pot.amount, 0);

it("conserves chips, ends every round and pays out every hand in random play", () => {
  for (let game = 0; game < 300; game++) {
    const next = random(game);
    const count = 2 + Math.floor(next() * 8);
    const stacks = Array.from(
      { length: count },
      () => 1 + Math.floor(next() * 3000)
    );
    const total = stacks.reduce((sum, stack) => sum + stack);
    let round = postBlinds(players(...stacks), game % count, blinds);

    for (let number = 0; number < 4; number++) {
      if (number > 0) {
        if (round.seats.filter(isInHand).length < 2) break;
        round = nextBettingRound(round);
        expect(onTable(round)).toBe(total);
        // only players still in the hand can win a pot
        const inHand = round.seats.filter(isInHand).map((seat) => seat.seat);
        for (const pot of round.pots) {
          expect(pot.seats.every((seat) => inHand.includes(seat))).toBe(true);
        }
      }
      // every action moves the round on, so it ends within a bounded number of steps
      for (let step = 0; round.toAct !== null; step++) {
        expect(step).toBeLessThan(count * 50);
        round = click(round, randomButton(round, next));
        expect(chips(round)).toBe(total);
        expect(onTable(round)).toBe(total);
        expect(round.seats.every((seat) => seat.stack >= 0)).toBe(true);
      }
    }

    // ranks from 0 to 2, so ties are common
    const ranks = Object.fromEntries(
      round.seats.map((seat) => [seat.seat, Math.floor(next() * 3)])
    );
    const { round: paid } = awardPots(round, ranks);
    expect(paid.seats.reduce((sum, seat) => sum + seat.stack, 0)).toBe(total);
    expect(paid.pots).toEqual([]);
  }
});
