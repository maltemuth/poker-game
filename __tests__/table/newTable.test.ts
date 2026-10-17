/**
 * Tests for creating a table: the empty table, the default for new players,
 * and the options that are refused.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { newTable } from "../../src/table/newTable.js";
import { options } from "../helpers/table.js";

it("creates an empty table with the options", () => {
  const table = newTable(options);
  assert.deepEqual(table.seats, [null, null, null, null, null, null]);
  assert.deepEqual(table.spectators, []);
  assert.equal(table.button, null);
  assert.equal(table.hand, null);
  assert.equal(table.paused, false);
});

it("deals new players in from the next hand by default", () => {
  assert.equal(newTable(options).options.newPlayers, "nextHand");
  assert.equal(
    newTable({ ...options, newPlayers: "waitForBigBlind" }).options.newPlayers,
    "waitForBigBlind"
  );
});

it("refuses invalid options, naming every problem", () => {
  assert.throws(
    () =>
      newTable({
        blinds: { small: 200, big: 100 },
        buyIn: { min: 50, max: 40 },
        seats: 11,
      }),
    {
      message:
        "Invalid table options: the small blind can't be bigger than the big blind; " +
        "the smallest buy-in must be at least the big blind; " +
        "the largest buy-in can't be smaller than the smallest; " +
        "a table has 2 to 10 seats",
    }
  );
  assert.throws(
    () => newTable({ ...options, blinds: { small: 0.5, big: 1 } }),
    {
      message:
        "Invalid table options: blinds and buy-ins must be positive whole numbers of chips",
    }
  );
  assert.throws(
    () => newTable({ ...options, newPlayers: "whenever" as "nextHand" }),
    {
      message:
        "Invalid table options: newPlayers must be one of nextHand, waitForBigBlind, postBigBlind",
    }
  );
});

it("starts hands 5 seconds after they can by default", () => {
  assert.equal(newTable(options).options.nextHandDelay, 5000);
  assert.equal(
    newTable({ ...options, nextHandDelay: null }).options.nextHandDelay,
    null
  );
  assert.throws(() => newTable({ ...options, nextHandDelay: -1 }), {
    message:
      "Invalid table options: nextHandDelay must be null or whole milliseconds from 0 to 2147483647",
  });
  assert.throws(() => newTable({ ...options, nextHandDelay: 2.5 }), {
    message:
      "Invalid table options: nextHandDelay must be null or whole milliseconds from 0 to 2147483647",
  });
});

it("gives a player 30 seconds to act by default", () => {
  assert.equal(newTable(options).options.turnTimeout, 30000);
  assert.equal(
    newTable({ ...options, turnTimeout: null }).options.turnTimeout,
    null
  );
  assert.throws(() => newTable({ ...options, turnTimeout: 0 }), {
    message:
      "Invalid table options: turnTimeout must be null or whole milliseconds from 1 to 2147483647",
  });
});

it("deals a runout every 2 seconds, and hides hole cards from spectators, by default", () => {
  const table = newTable({ ...options, runoutDelay: undefined });
  assert.equal(table.options.runoutDelay, 2000);
  assert.equal(table.options.spectatorsSeeHoleCards, false);
  assert.throws(() => newTable({ ...options, runoutDelay: -5 }), {
    message:
      "Invalid table options: runoutDelay must be null or whole milliseconds from 0 to 2147483647",
  });
  assert.throws(
    () =>
      newTable({
        ...options,
        spectatorsSeeHoleCards: "yes" as unknown as boolean,
      }),
    {
      message:
        "Invalid table options: spectatorsSeeHoleCards must be true or false",
    }
  );
});
