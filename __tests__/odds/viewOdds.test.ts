/**
 * Tests for each hand's chances from a view: computed when every hand still
 * in is known, and not otherwise.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { assertCloseTo, assertNotCloseTo } from "../helpers/assert.js";
import { viewOdds } from "../../src/odds/viewOdds.js";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import { runout } from "../../src/table/runout.js";
import type { Table } from "../../src/table/Table.js";
import { SPECTATORS } from "../../src/views/audiences.js";
import { viewTable } from "../../src/views/viewTable.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const table = (fields: Partial<Table["options"]>) =>
  tableWith([seated("a"), seated("b"), seated("c")], {
    options: { ...emptyTable().options, runoutDelay: 1000, ...fields },
  });

it("gives the tabled hands' odds during a runout, to everyone", () => {
  const draw = deck(["AhAs", "KdKc", "QhQs"], 0, "2c7d9hJs3c");
  let t = startNextHand(table({}), draw);
  t = applyTableAction(t, "a", { type: "allIn" }, draw);
  t = applyTableAction(t, "b", { type: "call" }, draw);
  t = applyTableAction(t, "c", { type: "fold" }, draw);

  const preFlop = viewOdds(viewTable(t, SPECTATORS).hand!)!;
  assert.deepEqual(
    preFlop.map((o) => o.seat),
    [1, 2]
  );
  assertCloseTo(preFlop[0].winChance, 0.8106, 3);
  assertCloseTo(preFlop[1].winChance, 0.1855, 3);
  // players get the same, since the hands are tabled
  assert.deepEqual(viewOdds(viewTable(t, "c").hand!), preFlop);

  t = runout(t, { hand: 1, board: 0 }, draw);
  const flop = viewOdds(viewTable(t, SPECTATORS).hand!)!;
  assertNotCloseTo(flop[0].winChance, preFlop[0].winChance, 3);
  assertCloseTo(
    flop[0].winChance + flop[1].winChance + flop[0].tieChance,
    1,
    6
  );
});

it("gives spectators the odds all along at a table that shows them the hole cards", () => {
  const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
  const t = startNextHand(table({ spectatorsSeeHoleCards: true }), draw);
  const spectators = viewOdds(viewTable(t, SPECTATORS).hand!);
  assert.deepEqual(
    spectators?.map((o) => o.seat),
    [1, 2, 3]
  );
  // players don't know the other hands, so there are no odds for them
  assert.equal(viewOdds(viewTable(t, "a").hand!), null);
});

it("gives no odds while the hands are hidden, or once the hand is over", () => {
  const draw = deck(["AhAs", "KdKc", "QhQs"], 0);
  let t = startNextHand(table({}), draw);
  assert.equal(viewOdds(viewTable(t, SPECTATORS).hand!), null);
  t = applyTableAction(t, "a", { type: "fold" }, draw);
  t = applyTableAction(t, "b", { type: "fold" }, draw);
  assert.equal(viewOdds(viewTable(t, SPECTATORS).hand!), null);
});
