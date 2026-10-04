/**
 * Tests for starting a hand: the blinds, the hole cards dealt in order, and
 * a hand that moves on at once when the blinds leave no one to act.
 */

import { startHand } from "../../src/hand/startHand.js";
import { fixedDraw } from "../../src/hand/fixedDraw.js";
import { deck, players } from "../helpers/hand.js";

const blinds = { small: 50, big: 100 };

it("posts the blinds and deals two hole cards to everyone", () => {
  const hand = startHand(
    players(1000, 1000, 1000),
    0,
    blinds,
    deck(["AhAs", "KdKc", "QhQs"], 0)
  );
  expect(hand.holeCards).toEqual([
    ["Ah", "As"],
    ["Kd", "Kc"],
    ["Qh", "Qs"],
  ]);
  expect(hand.betting.seats.map((seat) => seat.bet)).toEqual([0, 50, 100]);
  expect(hand.board).toEqual([]);
  expect(hand.bettingRound).toBe("preFlop");
  expect(hand.result).toBeNull();
});

it("deals one card at a time, starting left of the button", () => {
  // button on seat 2: seat 3 gets the first card, then seat 1, then seat 2
  const hand = startHand(
    players(1000, 1000, 1000),
    1,
    blinds,
    fixedDraw(["2c", "3c", "4c", "5c", "6c", "7c"])
  );
  expect(hand.holeCards).toEqual([
    ["3c", "6c"],
    ["4c", "7c"],
    ["2c", "5c"],
  ]);
});

it("deals the whole board at once when the blinds put everyone all-in", () => {
  const hand = startHand(
    players(50, 100),
    1,
    blinds,
    deck(["AhAs", "KdKc"], 1, "2c7d9hJsQc")
  );
  expect(hand.board).toEqual(["2c", "7d", "9h", "Js", "Qc"]);
  expect(hand.result).not.toBeNull();
});
