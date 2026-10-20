/**
 * Tests for changing a table's options: until the first hand is dealt, any
 * option but the seats, checked like a new table's, keeping the chips
 * already on the table.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { checkSetOptions, setOptions } from "../../src/table/setOptions.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

it("changes the options given, and keeps the others", () => {
  const table = setOptions(emptyTable(), {
    type: "setOptions",
    options: { blinds: { small: 100, big: 200 }, turnTimeout: null },
  });
  assert.deepEqual(table.options.blinds, { small: 100, big: 200 });
  assert.equal(table.options.turnTimeout, null);
  assert.deepEqual(table.options.buyIn, emptyTable().options.buyIn);
});

it("keeps the chips of players already seated, outside a new buy-in range too", () => {
  const two = tableWith([seated("a", { stack: 1000 }), seated("b")]);
  const table = setOptions(two, {
    type: "setOptions",
    options: { buyIn: { min: 2000, max: 4000 } },
  });
  assert.equal(table.seats[0]?.stack, 1000);
  assert.deepEqual(table.options.buyIn, { min: 2000, max: 4000 });
});

it("ignores options left undefined, and keys that aren't options", () => {
  const table = setOptions(emptyTable(), {
    type: "setOptions",
    options: { turnTimeout: undefined, colour: "red" } as never,
  });
  assert.deepEqual(table.options, emptyTable().options);
});

it("refuses once a hand has been dealt", () => {
  const dealt = startNextHand(
    tableWith([seated("a"), seated("b")]),
    deck(["AhAs", "KdKc"], 0)
  );
  assert.equal(
    checkSetOptions(dealt, { type: "setOptions", options: {} }),
    "The options can't change once a hand has been dealt"
  );
});

it("refuses to change the seats, and invalid options, naming every problem", () => {
  const table = emptyTable();
  assert.equal(
    checkSetOptions(table, {
      type: "setOptions",
      options: { seats: 9 } as never,
    }),
    "A table's seats can't change"
  );
  assert.equal(
    checkSetOptions(table, {
      type: "setOptions",
      options: {
        blinds: { small: 300, big: 200 },
        buyIn: { min: 100, max: 50 },
      },
    }),
    "Invalid table options: the small blind can't be bigger than the big blind; " +
      "the smallest buy-in must be at least the big blind; " +
      "the largest buy-in can't be smaller than the smallest"
  );
  assert.equal(
    checkSetOptions(table, { type: "setOptions", options: null as never }),
    "The options to change are missing"
  );
});
