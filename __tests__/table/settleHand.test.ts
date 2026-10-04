/**
 * Tests for settling a finished hand onto the table: stacks with the
 * winnings, players without chips becoming spectators, and players who left
 * during the hand going.
 */

import { settleHand } from "../../src/table/settleHand.js";
import { leave } from "../../src/table/leave.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import type { Table } from "../../src/table/Table.js";
import { applyHandAction } from "../../src/hand/applyHandAction.js";
import { deck } from "../helpers/hand.js";
import { seated, tableWith } from "../helpers/table.js";

/** Plays the hand's actions directly, then settles */
const play = (
  table: Table,
  draw: ReturnType<typeof deck>,
  ...tos: number[]
) => {
  let hand = table.hand!;
  for (const to of tos) {
    hand = applyHandAction(
      hand,
      to < 0 ? { type: "fold" } : { type: "bet", to },
      draw
    );
  }
  return { ...table, hand };
};

it("gives every player their stack from the hand", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  let table = startNextHand(tableWith([seated("a"), seated("b")]), draw);
  // heads-up: a (button, small blind) folds
  table = settleHand(play(table, draw, -1));
  expect(table.seats.map((seat) => seat?.stack)).toEqual([
    950,
    1050,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);
});

it("makes a player without chips a spectator", () => {
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c");
  let table = startNextHand(tableWith([seated("a"), seated("b")]), draw);
  // all-in and call: a's aces beat b's kings
  table = settleHand(play(table, draw, 1000, 1000));
  expect(table.seats[0]?.stack).toBe(2000);
  expect(table.seats[1]).toBeNull();
  expect(table.spectators).toEqual([{ playerId: "b", name: "b" }]);
});

it("lets a player who left during the hand go with their chips", () => {
  const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
  let table = startNextHand(
    tableWith([seated("a"), seated("b"), seated("c")]),
    draw
  );
  // a, the button and first to act, leaves, which folds
  table = leave(table, "a", draw);
  expect(table.seats[0]?.leaving).toBe(true);
  expect(table.hand?.betting.seats[0].folded).toBe(true);
  // b (small blind) folds: c wins the blinds, and a leaves
  table = settleHand(play(table, draw, -1));
  expect(table.seats[0]).toBeNull();
  expect(table.spectators).toEqual([{ playerId: "a", name: "a" }]);
  expect(table.seats[2]?.stack).toBe(1050);
});

it("refuses while no hand is over", () => {
  expect(() => settleHand(tableWith([seated("a")]))).toThrow("No hand is over");
});
