/**
 * Tests for the entry point of every table action: each type goes to its
 * rule, and unknown actions are refused.
 */

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
  expect(table.hand?.betting.seats[0].bet).toBe(100);
  table = applyTableAction(table, "b", { type: "sitOut" }, draw);
  expect(table.seats[1]?.sittingOut).toBe(true);
  table = applyTableAction(table, "b", { type: "sitIn" }, draw);
  // standing up folds b's hand, which ends it: a wins, b leaves with 1,900
  table = applyTableAction(table, "b", { type: "standUp" }, draw);
  expect(table.seats[1]).toBeNull();
  expect(table.seats[0]?.stack).toBe(1100);
});

it("refuses unknown actions", () => {
  const table = tableWith([seated("a")]);
  expect(
    checkTableAction(table, "a", { type: "dance" } as unknown as TableAction)
  ).toBe("Unknown action");
  expect(checkTableAction(table, "a", null as unknown as TableAction)).toBe(
    "Unknown action"
  );
  expect(() =>
    applyTableAction(table, "a", { type: "sitIn" }, deck([], 0))
  ).toThrow("Invalid action: You aren't sitting out");
});

it("refuses a game action from a spectator", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const table = addSpectator(
    startNextHand(tableWith([seated("a"), seated("b")]), draw),
    { playerId: "s", name: "Sue" }
  );
  expect(checkTableAction(table, "s", { type: "fold" })).toBe(
    "You aren't in this hand"
  );
  expect(checkTableAction(table, "s", { type: "standUp" })).toBe(
    "You don't have a seat"
  );
});
