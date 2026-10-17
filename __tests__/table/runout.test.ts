/**
 * Tests for a paced all-in runout at the table: the steps it waits for, a
 * stale step refused, and the hand settled after the river.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import { checkRunout, currentRunout, runout } from "../../src/table/runout.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import type { Table } from "../../src/table/Table.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const paced = (): Table =>
  tableWith([seated("a"), seated("b")], {
    options: { ...emptyTable().options, runoutDelay: 1000 },
  });

const allIn = () => {
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c");
  let table = startNextHand(paced(), draw);
  table = applyTableAction(table, "a", { type: "allIn" }, draw);
  table = applyTableAction(table, "b", { type: "call" }, draw);
  return { table, draw };
};

it("waits for each step, and settles after the river", () => {
  const { draw, table: start } = allIn();
  let table = start;
  assert.deepEqual(currentRunout(table), { hand: 1, board: 0 });
  table = runout(table, { hand: 1, board: 0 }, draw);
  assert.deepEqual(currentRunout(table), { hand: 1, board: 3 });
  table = runout(table, { hand: 1, board: 3 }, draw);
  table = runout(table, { hand: 1, board: 4 }, draw);
  assert.equal(currentRunout(table), null);
  assert.notEqual(table.hand?.result, null);
  // a's aces win; b has nothing left and watches
  assert.equal(table.seats[0]?.stack, 2000);
  assert.equal(table.seats[1], null);
});

it("refuses a step that's out of date", () => {
  const { draw, table } = allIn();
  const flop = runout(table, { hand: 1, board: 0 }, draw);
  assert.equal(
    checkRunout(flop, { hand: 1, board: 0 }),
    "That runout step is over"
  );
  assert.equal(
    checkRunout(paced(), { hand: 0, board: 0 }),
    "That runout step is over"
  );
});

it("waits for no runout when the table deals it at once", () => {
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c");
  let table = startNextHand(tableWith([seated("a"), seated("b")]), draw);
  table = applyTableAction(table, "a", { type: "allIn" }, draw);
  table = applyTableAction(table, "b", { type: "call" }, draw);
  assert.equal(table.hand?.tabled, true);
  assert.equal(currentRunout(table), null);
  assert.notEqual(table.hand?.result, null);
});
