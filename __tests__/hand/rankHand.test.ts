/**
 * Tests for ranking hole cards with the board: the best five cards, the hand
 * type, and ranks that order and tie hands.
 */

import { rankHand } from "../../src/hand/rankHand.js";

const board = ["Kh", "Kc", "7d", "4s", "2c"];

it("finds the best five cards and the hand type", () => {
  expect(rankHand(["Ks", "7h"], board)).toEqual({
    best: ["Ks", "Kh", "Kc", "7h", "7d"],
    type: "fullHouse",
    rank: 0x7ddd77,
  });
});

it("ranks better hands higher", () => {
  const trips = rankHand(["Kd", "9s"], board);
  const twoPair = rankHand(["Ac", "7h"], board);
  expect(trips.type).toBe("threeOfAKind");
  expect(twoPair.type).toBe("twoPair");
  expect(trips.rank).toBeGreaterThan(twoPair.rank);
});

it("ranks hands that tie equally, whatever the suits", () => {
  const plays = rankHand(["Ad", "Qs"], board);
  const same = rankHand(["Ah", "Qd"], board);
  expect(plays.rank).toBe(same.rank);
});

it("counts the kickers", () => {
  expect(rankHand(["Ad", "Qs"], board).rank).toBeGreaterThan(
    rankHand(["Ad", "Js"], board).rank
  );
});
