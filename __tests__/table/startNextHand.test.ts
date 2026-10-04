/**
 * Tests for dealing the next hand at a table: the button moving, new players
 * joining, and hands that can't start.
 */

import {
  checkStartHand,
  startNextHand,
} from "../../src/table/startNextHand.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const draw = () => deck(["AhAs", "KdKc", "QhQs", "JdJc", "Tc9c", "8h7h"], 0);

it("deals the players in the game, with the button on the first one", () => {
  const table = startNextHand(
    tableWith([seated("a"), null, seated("c")]),
    draw()
  );
  expect(table.button).toBe(0);
  expect(table.hand?.betting.seats.map((seat) => seat.seat)).toEqual([1, 3]);
  // heads-up, the button posts the small blind
  expect(table.hand?.betting.seats.map((seat) => seat.bet)).toEqual([50, 100]);
});

it("moves the button from the last hand's", () => {
  const table = tableWith([seated("a"), seated("b"), seated("c")], {
    button: 0,
  });
  expect(startNextHand(table, draw()).button).toBe(1);
});

it("deals in a new player posting a big blind, who's in the game from then on", () => {
  const table = tableWith(
    [seated("a"), seated("b"), seated("c"), seated("n", { newPlayer: true })],
    {
      options: { ...emptyTable().options, newPlayers: "postBigBlind" },
      button: 2,
    }
  );
  const started = startNextHand(table, draw());
  expect(started.hand?.betting.seats.map((seat) => seat.bet)).toEqual([
    0, 50, 100, 100,
  ]);
  expect(started.seats[3]?.newPlayer).toBe(false);
});

it("refuses while a hand is played, or without enough players", () => {
  const playing = startNextHand(tableWith([seated("a"), seated("b")]), draw());
  expect(checkStartHand(playing)).toBe("A hand is being played");
  expect(checkStartHand(tableWith([seated("a")]))).toBe("Waiting for players");
  expect(() => startNextHand(tableWith([seated("a")]), draw())).toThrow(
    "Can't start a hand: Waiting for players"
  );
});

it("settles a hand the blinds play out at once", () => {
  // both blinds all-in: the board is dealt, the hand settled
  const table = tableWith([
    seated("a", { stack: 50 }),
    seated("b", { stack: 100 }),
  ]);
  const started = startNextHand(table, deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c"));
  expect(started.hand?.result).not.toBeNull();
  // aces win 100: 50 from each; b keeps the uncalled 50
  expect(started.seats[0]?.stack).toBe(100);
  expect(started.seats[1]?.stack).toBe(50);
});
