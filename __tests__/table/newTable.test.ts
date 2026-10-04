/**
 * Tests for creating a table: the empty table, the default for new players,
 * and the options that are refused.
 */

import { newTable } from "../../src/table/newTable.js";
import { options } from "../helpers/table.js";

it("creates an empty table with the options", () => {
  const table = newTable(options);
  expect(table.seats).toEqual([null, null, null, null, null, null]);
  expect(table.spectators).toEqual([]);
  expect(table.button).toBeNull();
  expect(table.hand).toBeNull();
  expect(table.paused).toBe(false);
});

it("deals new players in from the next hand by default", () => {
  expect(newTable(options).options.newPlayers).toBe("nextHand");
  expect(
    newTable({ ...options, newPlayers: "waitForBigBlind" }).options.newPlayers
  ).toBe("waitForBigBlind");
});

it("refuses invalid options, naming every problem", () => {
  expect(() =>
    newTable({
      blinds: { small: 200, big: 100 },
      buyIn: { min: 50, max: 40 },
      seats: 11,
    })
  ).toThrow(
    "Invalid table options: the small blind can't be bigger than the big blind; " +
      "the smallest buy-in must be at least the big blind; " +
      "the largest buy-in can't be smaller than the smallest; " +
      "a table has 2 to 10 seats"
  );
  expect(() =>
    newTable({ ...options, blinds: { small: 0.5, big: 1 } })
  ).toThrow("blinds and buy-ins must be positive whole numbers of chips");
  expect(() =>
    newTable({ ...options, newPlayers: "whenever" as "nextHand" })
  ).toThrow(
    "newPlayers must be one of nextHand, waitForBigBlind, postBigBlind"
  );
});
