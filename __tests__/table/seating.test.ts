/**
 * Tests for seating: sitting down with a buy-in, new players at a running
 * game, a break and sitting in again, and leaving, during and between hands.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertMatchObject } from "../helpers/assert.js";
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
    assert.deepEqual(after.spectators, []);
    assert.deepEqual(after.seats[2], seated("ann", { stack: 2000 }));
  });

  it("refuses taken and missing seats, and buy-ins out of range", () => {
    const taken = tableWith([seated("bob")], {
      spectators: [{ playerId: "ann", name: "ann" }],
    });
    const check = (t: Table, seat: number, buyIn: number) =>
      checkSitDown(t, "ann", { type: "sitDown", seat, buyIn });
    assert.equal(check(taken, 1, 2000), "Seat 1 is taken");
    assert.equal(check(table, 7, 2000), "There's no seat 7");
    assert.equal(check(table, 1.5, 2000), "There's no seat 1.5");
    assert.equal(
      check(table, 1, 999),
      "The buy-in must be a whole number of chips from 1000 to 5000"
    );
    assert.equal(
      check(table, 1, 5001),
      "The buy-in must be a whole number of chips from 1000 to 5000"
    );
  });

  it("refuses someone seated or not at the table", () => {
    const sitting = tableWith([seated("ann")]);
    assert.equal(
      checkSitDown(sitting, "ann", { type: "sitDown", seat: 2, buyIn: 1000 }),
      "You already have a seat"
    );
    assert.equal(
      checkSitDown(table, "eve", { type: "sitDown", seat: 2, buyIn: 1000 }),
      "Only people at the table can sit down"
    );
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
      assert.equal(after.seats[3]?.newPlayer, true);
    }
  });

  it("doesn't make them a new player at a table that's starting, or by default", () => {
    const starting = watching(
      tableWith([seated("bob")], {
        options: { ...emptyTable().options, newPlayers: "waitForBigBlind" },
      }),
      "ann"
    );
    assert.equal(
      sitDown(starting, "ann", { type: "sitDown", seat: 4, buyIn: 1000 })
        .seats[3]?.newPlayer,
      false
    );
    const byDefault = watching(tableWith([seated("bob"), seated("cy")]), "ann");
    assert.equal(
      sitDown(byDefault, "ann", { type: "sitDown", seat: 4, buyIn: 1000 })
        .seats[3]?.newPlayer,
      false
    );
  });
});

describe("a break", () => {
  const table = tableWith([seated("ann"), seated("bob")]);
  const noCards = () => deck([], 0);

  it("keeps the seat and chips, and isn't dealt in until sitting in again", () => {
    const onBreak = standUp(table, "ann", noCards());
    assertMatchObject(onBreak.seats[0], { sittingOut: true, stack: 1000 });
    assert.equal(checkStandUp(onBreak, "ann"), "You're already on a break");
    assert.equal(sitIn(onBreak, "ann").seats[0]?.sittingOut, false);
    assert.equal(checkSitIn(table, "ann"), "You aren't on a break");
  });

  it("folds a running hand at once, out of turn", () => {
    const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
    // a (button) is to act; c, the big blind, takes a break
    let playing = startNextHand(
      tableWith([seated("a"), seated("b"), seated("c")]),
      draw
    );
    playing = standUp(playing, "c", draw);
    assert.equal(playing.hand?.betting.seats[2].folded, true);
    assert.equal(playing.hand?.betting.toAct, 0);
    assertMatchObject(playing.seats[2], {
      sittingOut: true,
      leaving: false,
    });
  });

  it("keeps the seat when the fold ends the hand", () => {
    const draw = deck(["AhAs", "KdKc"], 0);
    let playing = startNextHand(tableWith([seated("a"), seated("b")]), draw);
    playing = standUp(playing, "b", draw);
    assert.notEqual(playing.hand?.result, null);
    // b's big blind is dead money; b keeps the seat with 900
    assert.deepEqual(
      playing.seats.slice(0, 2).map((seat) => seat?.stack),
      [1100, 900]
    );
    assert.equal(playing.seats[1]?.sittingOut, true);
  });

  it("refuses someone without a seat", () => {
    assert.equal(checkStandUp(table, "eve"), "You don't have a seat");
    assert.equal(checkSitIn(table, "eve"), "You don't have a seat");
  });
});

describe("leaving", () => {
  it("makes a player a spectator with their chips between hands", () => {
    const after = leave(
      tableWith([seated("ann"), seated("bob")]),
      "ann",
      deck([], 0)
    );
    assert.equal(after.seats[0], null);
    assert.deepEqual(after.spectators, [{ playerId: "ann", name: "ann" }]);
  });

  it("folds a running hand at once, and leaves when it's over", () => {
    const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
    let table = startNextHand(
      tableWith([seated("a"), seated("b"), seated("c")]),
      draw
    );
    table = leave(table, "c", draw);
    assert.equal(table.hand?.betting.seats[2].folded, true);
    assertMatchObject(table.seats[2], { leaving: true, stack: 1000 });
  });

  it("leaves at once when the fold ends the hand", () => {
    const draw = deck(["AhAs", "KdKc"], 0);
    let table = startNextHand(tableWith([seated("a"), seated("b")]), draw);
    table = leave(table, "b", draw);
    assert.equal(table.seats[1], null);
    assert.deepEqual(table.spectators, [{ playerId: "b", name: "b" }]);
    assert.equal(table.seats[0]?.stack, 1100);
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
    assert.equal(table.hand?.betting.seats[0].folded, false);
    assert.equal(table.seats[0]?.leaving, true);
  });

  it("refuses someone without a seat", () => {
    assert.equal(checkLeave(emptyTable(), "ann"), "You don't have a seat");
  });
});
