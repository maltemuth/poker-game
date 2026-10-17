/**
 * Tests for dealing the next hand at a table: the button moving, new players
 * joining, and hands that can't start.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
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
  assert.equal(table.button, 0);
  assert.deepEqual(
    table.hand?.betting.seats.map((seat) => seat.seat),
    [1, 3]
  );
  // heads-up, the button posts the small blind
  assert.deepEqual(
    table.hand?.betting.seats.map((seat) => seat.bet),
    [50, 100]
  );
});

it("moves the button from the last hand's", () => {
  const table = tableWith([seated("a"), seated("b"), seated("c")], {
    button: 0,
  });
  assert.equal(startNextHand(table, draw()).button, 1);
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
  assert.deepEqual(
    started.hand?.betting.seats.map((seat) => seat.bet),
    [0, 50, 100, 100]
  );
  assert.equal(started.seats[3]?.newPlayer, false);
});

it("refuses while a hand is played, or without enough players", () => {
  const playing = startNextHand(tableWith([seated("a"), seated("b")]), draw());
  assert.equal(checkStartHand(playing), "A hand is being played");
  assert.equal(checkStartHand(tableWith([seated("a")])), "Waiting for players");
  assert.throws(() => startNextHand(tableWith([seated("a")]), draw()), {
    message: "Can't start a hand: Waiting for players",
  });
});

it("settles a hand the blinds play out at once", () => {
  // both blinds all-in: the board is dealt, the hand settled
  const table = tableWith([
    seated("a", { stack: 50 }),
    seated("b", { stack: 100 }),
  ]);
  const started = startNextHand(table, deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c"));
  assert.notEqual(started.hand?.result, null);
  // aces win 100: 50 from each; b keeps the uncalled 50
  assert.equal(started.seats[0]?.stack, 100);
  assert.equal(started.seats[1]?.stack, 50);
});
