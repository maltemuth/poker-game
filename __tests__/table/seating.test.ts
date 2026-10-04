/**
 * Tests for seating: sitting down with a buy-in, new players at a running
 * game, standing up during and between hands, sitting out and in again.
 */

import { addSpectator } from "../../src/table/addSpectator.js";
import { checkSitDown, sitDown } from "../../src/table/sitDown.js";
import { checkSitIn, sitIn } from "../../src/table/sitIn.js";
import { checkSitOut, sitOut } from "../../src/table/sitOut.js";
import { checkStandUp, standUp } from "../../src/table/standUp.js";
import type { Table } from "../../src/table/Table.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const watching = (table: Table, playerId: string) =>
  addSpectator(table, { playerId, name: playerId });

describe("sitting down", () => {
  const table = watching(emptyTable(), "ann");

  it("seats a spectator with their buy-in", () => {
    const after = sitDown(table, "ann", {
      type: "sitDown",
      seat: 3,
      buyIn: 2000,
    });
    expect(after.spectators).toEqual([]);
    expect(after.seats[2]).toEqual(seated("ann", { stack: 2000 }));
  });

  it("refuses taken and missing seats, and buy-ins out of range", () => {
    const taken = tableWith([seated("bob")], {
      spectators: [{ playerId: "ann", name: "ann" }],
    });
    const check = (t: Table, seat: number, buyIn: number) =>
      checkSitDown(t, "ann", { type: "sitDown", seat, buyIn });
    expect(check(taken, 1, 2000)).toBe("Seat 1 is taken");
    expect(check(table, 7, 2000)).toBe("There's no seat 7");
    expect(check(table, 1.5, 2000)).toBe("There's no seat 1.5");
    expect(check(table, 1, 999)).toBe(
      "The buy-in must be a whole number of chips from 1000 to 5000"
    );
    expect(check(table, 1, 5001)).toBe(
      "The buy-in must be a whole number of chips from 1000 to 5000"
    );
  });

  it("refuses someone seated or not at the table", () => {
    const sitting = tableWith([seated("ann")]);
    expect(
      checkSitDown(sitting, "ann", { type: "sitDown", seat: 2, buyIn: 1000 })
    ).toBe("You already have a seat");
    expect(
      checkSitDown(table, "eve", { type: "sitDown", seat: 2, buyIn: 1000 })
    ).toBe("Only people at the table can sit down");
  });

  it("makes them a new player when a game is running and the table has a rule for it", () => {
    for (const newPlayers of ["waitForBigBlind", "postBigBlind"] as const) {
      const running = watching(
        tableWith([seated("bob"), seated("cy")], {
          options: { ...emptyTable().options, newPlayers },
        }),
        "ann"
      );
      const after = sitDown(running, "ann", {
        type: "sitDown",
        seat: 4,
        buyIn: 1000,
      });
      expect(after.seats[3]?.newPlayer).toBe(true);
    }
  });

  it("doesn't make them a new player at a table that's starting, or by default", () => {
    const starting = watching(
      tableWith([seated("bob")], {
        options: { ...emptyTable().options, newPlayers: "waitForBigBlind" },
      }),
      "ann"
    );
    expect(
      sitDown(starting, "ann", { type: "sitDown", seat: 4, buyIn: 1000 })
        .seats[3]?.newPlayer
    ).toBe(false);
    const byDefault = watching(tableWith([seated("bob"), seated("cy")]), "ann");
    expect(
      sitDown(byDefault, "ann", { type: "sitDown", seat: 4, buyIn: 1000 })
        .seats[3]?.newPlayer
    ).toBe(false);
  });
});

describe("standing up", () => {
  it("makes a player a spectator between hands", () => {
    const after = standUp(tableWith([seated("ann"), seated("bob")]), "ann");
    expect(after.seats[0]).toBeNull();
    expect(after.spectators).toEqual([{ playerId: "ann", name: "ann" }]);
  });

  it("refuses someone without a seat", () => {
    expect(checkStandUp(emptyTable(), "ann")).toBe("You don't have a seat");
  });
});

describe("sitting out and in", () => {
  const table = tableWith([seated("ann"), seated("bob")]);

  it("sits a player out, and in again", () => {
    const out = sitOut(table, "ann");
    expect(out.seats[0]?.sittingOut).toBe(true);
    expect(checkSitOut(out, "ann")).toBe("You're already sitting out");
    expect(sitIn(out, "ann").seats[0]?.sittingOut).toBe(false);
    expect(checkSitIn(table, "ann")).toBe("You aren't sitting out");
  });

  it("refuses someone without a seat", () => {
    expect(checkSitOut(table, "eve")).toBe("You don't have a seat");
    expect(checkSitIn(table, "eve")).toBe("You don't have a seat");
  });
});
