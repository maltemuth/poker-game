/**
 * Tests for seating: sitting down with a buy-in, new players at a running
 * game, a break and sitting in again, and leaving, during and between hands.
 */

import { applyHandAction } from "../../src/hand/applyHandAction.js";
import { addSpectator } from "../../src/table/addSpectator.js";
import { checkLeave, leave } from "../../src/table/leave.js";
import { checkSitDown, sitDown } from "../../src/table/sitDown.js";
import { checkSitIn, sitIn } from "../../src/table/sitIn.js";
import { checkStandUp, standUp } from "../../src/table/standUp.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import type { Table } from "../../src/table/Table.js";
import { deck } from "../helpers/hand.js";
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

describe("a break", () => {
  const table = tableWith([seated("ann"), seated("bob")]);
  const noCards = () => deck([], 0);

  it("keeps the seat and chips, and isn't dealt in until sitting in again", () => {
    const onBreak = standUp(table, "ann", noCards());
    expect(onBreak.seats[0]).toMatchObject({ sittingOut: true, stack: 1000 });
    expect(checkStandUp(onBreak, "ann")).toBe("You're already on a break");
    expect(sitIn(onBreak, "ann").seats[0]?.sittingOut).toBe(false);
    expect(checkSitIn(table, "ann")).toBe("You aren't on a break");
  });

  it("folds a running hand at once, out of turn", () => {
    const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
    // a (button) is to act; c, the big blind, takes a break
    let playing = startNextHand(
      tableWith([seated("a"), seated("b"), seated("c")]),
      draw
    );
    playing = standUp(playing, "c", draw);
    expect(playing.hand?.betting.seats[2].folded).toBe(true);
    expect(playing.hand?.betting.toAct).toBe(0);
    expect(playing.seats[2]).toMatchObject({
      sittingOut: true,
      leaving: false,
    });
  });

  it("keeps the seat when the fold ends the hand", () => {
    const draw = deck(["AhAs", "KdKc"], 0);
    let playing = startNextHand(tableWith([seated("a"), seated("b")]), draw);
    playing = standUp(playing, "b", draw);
    expect(playing.hand?.result).not.toBeNull();
    // b's big blind is dead money; b keeps the seat with 900
    expect(playing.seats.slice(0, 2).map((seat) => seat?.stack)).toEqual([
      1100, 900,
    ]);
    expect(playing.seats[1]?.sittingOut).toBe(true);
  });

  it("refuses someone without a seat", () => {
    expect(checkStandUp(table, "eve")).toBe("You don't have a seat");
    expect(checkSitIn(table, "eve")).toBe("You don't have a seat");
  });
});

describe("leaving", () => {
  it("makes a player a spectator with their chips between hands", () => {
    const after = leave(
      tableWith([seated("ann"), seated("bob")]),
      "ann",
      deck([], 0)
    );
    expect(after.seats[0]).toBeNull();
    expect(after.spectators).toEqual([{ playerId: "ann", name: "ann" }]);
  });

  it("folds a running hand at once, and leaves when it's over", () => {
    const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
    let table = startNextHand(
      tableWith([seated("a"), seated("b"), seated("c")]),
      draw
    );
    table = leave(table, "c", draw);
    expect(table.hand?.betting.seats[2].folded).toBe(true);
    expect(table.seats[2]).toMatchObject({ leaving: true, stack: 1000 });
  });

  it("leaves at once when the fold ends the hand", () => {
    const draw = deck(["AhAs", "KdKc"], 0);
    let table = startNextHand(tableWith([seated("a"), seated("b")]), draw);
    table = leave(table, "b", draw);
    expect(table.seats[1]).toBeNull();
    expect(table.spectators).toEqual([{ playerId: "b", name: "b" }]);
    expect(table.seats[0]?.stack).toBe(1100);
  });

  it("doesn't fold an all-in player, who leaves when the hand is over", () => {
    const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
    // a goes all-in pre-flop, then leaves before the others have acted
    let table = startNextHand(
      tableWith([seated("a"), seated("b"), seated("c")]),
      draw
    );
    table = {
      ...table,
      hand: applyHandAction(table.hand!, { type: "bet", to: 1000 }, draw),
    };
    table = leave(table, "a", draw);
    expect(table.hand?.betting.seats[0].folded).toBe(false);
    expect(table.seats[0]?.leaving).toBe(true);
  });

  it("refuses someone without a seat", () => {
    expect(checkLeave(emptyTable(), "ann")).toBe("You don't have a seat");
  });
});
