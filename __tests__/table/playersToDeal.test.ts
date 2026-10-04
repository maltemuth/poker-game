/**
 * Tests for who is dealt into the next hand: the players in the game, a
 * table that's starting, and the three rules for new players.
 */

import { playersToDeal } from "../../src/table/playersToDeal.js";
import type { NewPlayerRule } from "../../src/table/TableOptions.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const rules = (newPlayers: NewPlayerRule) => ({
  options: { ...emptyTable().options, newPlayers },
});

it("deals in the players in the game, skipping empty seats and those sitting out", () => {
  const table = tableWith(
    [
      seated("a"),
      null,
      seated("c", { sittingOut: true }),
      seated("d"),
      seated("e"),
    ],
    { button: 0 }
  );
  expect(playersToDeal(table)).toEqual({
    seats: [0, 3, 4],
    button: 3,
    extraBigBlinds: [],
  });
});

it("deals no hand to fewer than two players", () => {
  expect(playersToDeal(tableWith([seated("a")]))).toBeNull();
  expect(
    playersToDeal(tableWith([seated("a"), seated("b", { sittingOut: true })]))
  ).toBeNull();
});

it("deals everyone in at a table that's starting, new or not", () => {
  const table = tableWith(
    [
      seated("a"),
      seated("b", { newPlayer: true }),
      seated("c", { newPlayer: true }),
    ],
    rules("waitForBigBlind")
  );
  expect(playersToDeal(table)?.seats).toEqual([0, 1, 2]);
});

describe("waiting for the big blind", () => {
  // the game is a, b, c in seats 1-3; new player n sits in seat 5
  const table = (button: number) =>
    tableWith(
      [
        seated("a"),
        seated("b"),
        seated("c"),
        null,
        seated("n", { newPlayer: true }),
      ],
      { ...rules("waitForBigBlind"), button }
    );

  it("deals the new player in when their seat is the big blind", () => {
    // the button moves to seat 2, the small blind is seat 3, and the next
    // seat, n's seat 5, is the big blind
    expect(playersToDeal(table(0))).toEqual({
      seats: [0, 1, 2, 4],
      button: 1,
      extraBigBlinds: [],
    });
  });

  it("waits while their seat would be the small blind or later", () => {
    // button to seat 3: n's seat 5 would be the small blind
    expect(playersToDeal(table(1))?.seats).toEqual([0, 1, 2]);
    // button to seat 1: the blinds are seats 2 and 3, before n
    expect(playersToDeal(table(2))?.seats).toEqual([0, 1, 2]);
  });
});

describe("posting a big blind", () => {
  const table = (button: number) =>
    tableWith(
      [
        seated("a"),
        seated("b"),
        seated("c"),
        seated("n", { newPlayer: true }),
        null,
        null,
      ],
      { ...rules("postBigBlind"), button }
    );

  it("deals the new player in with an extra big blind", () => {
    // button to seat 1: blinds seats 2 and 3, n in seat 4 posts a big blind too
    expect(playersToDeal(table(2))).toEqual({
      seats: [0, 1, 2, 3],
      button: 0,
      extraBigBlinds: [3],
    });
  });

  it("has a new player in the big blind's seat post just the big blind", () => {
    // button to seat 2: small blind seat 3, big blind n's seat 4
    expect(playersToDeal(table(0))).toEqual({
      seats: [0, 1, 2, 3],
      button: 1,
      extraBigBlinds: [],
    });
  });

  it("makes a new player in the small blind's seat wait a hand", () => {
    // button to seat 3: n's seat 4 would be the small blind
    expect(playersToDeal(table(1))).toEqual({
      seats: [0, 1, 2],
      button: 2,
      extraBigBlinds: [],
    });
  });
});
