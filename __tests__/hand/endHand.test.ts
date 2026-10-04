/**
 * Tests for the end of a hand: showdown with every hand shown and ranked,
 * split pots, a side pot won by another player, and a hand won because
 * everyone else folded.
 */

import { endHand } from "../../src/hand/endHand.js";
import type { Hand } from "../../src/hand/Hand.js";
import { round } from "../helpers/betting.js";

const river = (
  holeCards: string[][],
  board: string,
  seats: Parameters<typeof round>[0]
): Hand => ({
  betting: round(seats, { toAct: null }),
  holeCards: holeCards.map((cards) => cards),
  board: board.match(/../g) ?? [],
  bettingRound: "river",
  result: null,
});

it("shows every hand still in, and pays the best one", () => {
  const hand = river(
    [
      ["Ah", "As"],
      ["Kd", "Kc"],
      ["Qh", "2s"],
    ],
    "2c7d9hJsTc",
    [
      { committed: 300, stack: 700 },
      { committed: 300, stack: 700 },
      { committed: 100, stack: 900, folded: true },
    ]
  );
  const { result, betting } = endHand(hand);
  expect(result?.shown.map((shown) => [shown.seat, shown.type])).toEqual([
    [1, "pair"],
    [2, "pair"],
  ]);
  expect(result?.shown[0]).toMatchObject({
    cards: ["Ah", "As"],
    best: ["Ah", "As", "Js", "Tc", "9h"],
  });
  expect(result?.awards).toEqual([[{ seat: 1, amount: 700 }]]);
  expect(betting.seats.map((seat) => seat.stack)).toEqual([1400, 700, 900]);
});

it("splits the pot when the board plays", () => {
  const hand = river(
    [
      ["2h", "3s"],
      ["4d", "5c"],
    ],
    "AhKdQcJsTh",
    [
      { committed: 500, stack: 500 },
      { committed: 500, stack: 500 },
    ]
  );
  expect(endHand(hand).result?.awards).toEqual([
    [
      { seat: 2, amount: 500 },
      { seat: 1, amount: 500 },
    ],
  ]);
});

it("pays a side pot to another player than the main pot", () => {
  // seat 1 is all-in for 200 with the best hand; seats 2 and 3 put in 600
  const hand = river(
    [
      ["Ah", "As"],
      ["Kd", "Kc"],
      ["Qh", "Qs"],
    ],
    "2c7d9hJs3c",
    [
      { committed: 200, stack: 0 },
      { committed: 600, stack: 400 },
      { committed: 600, stack: 400 },
    ]
  );
  expect(endHand(hand).result?.awards).toEqual([
    [{ seat: 1, amount: 600 }],
    [{ seat: 2, amount: 800 }],
  ]);
});

it("pays the last player without showing when everyone else folded", () => {
  const hand: Hand = {
    ...river(
      [
        ["Ah", "As"],
        ["Kd", "Kc"],
      ],
      "",
      [
        { bet: 100, stack: 900 },
        { bet: 50, stack: 950, folded: true },
      ]
    ),
    bettingRound: "preFlop",
  };
  const { result } = endHand(hand);
  expect(result?.shown).toEqual([]);
  expect(result?.awards).toEqual([[{ seat: 1, amount: 100 }]]);
});
