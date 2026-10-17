/**
 * Tests for ranking hole cards with the board: the best five cards, the hand
 * type, and ranks that order and tie hands.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { rankHand } from "../../src/hand/rankHand.js";

const board = ["Kh", "Kc", "7d", "4s", "2c"];

it("finds the best five cards and the hand type", () => {
  assert.deepEqual(rankHand(["Ks", "7h"], board), {
    best: ["Ks", "Kh", "Kc", "7h", "7d"],
    type: "fullHouse",
    rank: 0x7ddd77,
  });
});

it("ranks better hands higher", () => {
  const trips = rankHand(["Kd", "9s"], board);
  const twoPair = rankHand(["Ac", "7h"], board);
  assert.equal(trips.type, "threeOfAKind");
  assert.equal(twoPair.type, "twoPair");
  assert.ok(trips.rank > twoPair.rank);
});

it("ranks hands that tie equally, whatever the suits", () => {
  const plays = rankHand(["Ad", "Qs"], board);
  const same = rankHand(["Ah", "Qd"], board);
  assert.equal(plays.rank, same.rank);
});

it("counts the kickers", () => {
  assert.ok(
    rankHand(["Ad", "Qs"], board).rank > rankHand(["Ad", "Js"], board).rank
  );
});
