/**
 * Tests for the entry point of every table action: each type goes to its
 * rule, and unknown actions are refused.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { assertMatchObject } from "../helpers/assert.js";
import { addSpectator } from "../../src/table/addSpectator.js";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import { checkTableAction } from "../../src/table/checkTableAction.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import type { TableAction } from "../../src/table/TableAction.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

it("plays seating and betting actions", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  let table = addSpectator(emptyTable(), { playerId: "a", name: "Ann" });
  table = addSpectator(table, { playerId: "b", name: "Bob" });
  table = applyTableAction(
    table,
    "a",
    { type: "sitDown", seat: 1, buyIn: 1000 },
    draw
  );
  table = applyTableAction(
    table,
    "b",
    { type: "sitDown", seat: 2, buyIn: 2000 },
    draw
  );
  table = startNextHand(table, draw);
  table = applyTableAction(table, "a", { type: "call" }, draw);
  assert.equal(table.hand?.betting.seats[0].bet, 100);
  // b takes a break, which folds the hand: a wins, b keeps the seat
  table = applyTableAction(table, "b", { type: "standUp" }, draw);
  assertMatchObject(table.seats[1], { sittingOut: true, stack: 1900 });
  table = applyTableAction(table, "b", { type: "sitIn" }, draw);
  assert.equal(table.seats[1]?.sittingOut, false);
  table = applyTableAction(table, "b", { type: "leave" }, draw);
  assert.equal(table.seats[1], null);
  assert.equal(table.seats[0]?.stack, 1100);
});

it("refuses unknown actions", () => {
  const table = tableWith([seated("a")]);
  assert.equal(
    checkTableAction(table, "a", { type: "dance" } as unknown as TableAction),
    "Unknown action"
  );
  assert.equal(
    checkTableAction(table, "a", null as unknown as TableAction),
    "Unknown action"
  );
  assert.throws(
    () => applyTableAction(table, "a", { type: "sitIn" }, deck([], 0)),
    { message: "Invalid action: You aren't on a break" }
  );
});

it("refuses a game action from a spectator", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const table = addSpectator(
    startNextHand(tableWith([seated("a"), seated("b")]), draw),
    { playerId: "s", name: "Sue" }
  );
  assert.equal(
    checkTableAction(table, "s", { type: "fold" }),
    "You aren't in this hand"
  );
  assert.equal(
    checkTableAction(table, "s", { type: "standUp" }),
    "You don't have a seat"
  );
});
