/**
 * Tests for blind levels: generated from the table's blinds and progression,
 * rounded to chip-friendly amounts and always going up, a hand's level from
 * its number, and the blinds a dealt hand and the views get.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import {
  blindLevelOfHand,
  blindsAtLevel,
  levelOfHand,
} from "../../src/table/blindLevels.js";
import { optionProblems } from "../../src/table/optionProblems.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import type { Table } from "../../src/table/Table.js";
import type { TableOptions } from "../../src/table/TableOptions.js";
import { viewTable } from "../../src/views/viewTable.js";
import { SPECTATORS } from "../../src/views/audiences.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const withProgression = (
  everyHands: number,
  raisePercent: number,
  blinds = { small: 50, big: 100 }
): TableOptions => ({
  ...emptyTable().options,
  blinds,
  blindProgression: { everyHands, raisePercent },
});

it("raises the big blind by the percentage, to chip-friendly amounts", () => {
  const options = withProgression(10, 50);
  const bigs = [1, 2, 3, 4, 5, 6, 7].map(
    (level) => blindsAtLevel(options, level).big
  );
  // 100 × 1.5^n is 150, 225, 337.5, 506, 759 and 1139: rounded, 200, 200,
  // 300, 500, 800 and 1000; where a level would repeat, it goes one step up
  assert.deepEqual(bigs, [100, 200, 300, 400, 500, 800, 1000]);
});

it("always goes up, even where rounding would repeat a level", () => {
  const options = withProgression(10, 10);
  const bigs = [1, 2, 3, 4, 5].map(
    (level) => blindsAtLevel(options, level).big
  );
  for (let i = 1; i < bigs.length; i++) assert.ok(bigs[i] > bigs[i - 1]);
});

it("keeps the small blind in the table's ratio", () => {
  const options = withProgression(10, 100, { small: 25, big: 100 });
  assert.deepEqual(blindsAtLevel(options, 1), { small: 25, big: 100 });
  assert.deepEqual(blindsAtLevel(options, 2), { small: 50, big: 200 });
  assert.deepEqual(blindsAtLevel(options, 3), { small: 100, big: 400 });
});

it("puts every so many hands in a level, and every hand in level 1 without a progression", () => {
  const options = withProgression(3, 50);
  assert.deepEqual(
    [1, 2, 3, 4, 6, 7].map((hand) => levelOfHand(options, hand)),
    [1, 1, 1, 2, 2, 3]
  );
  assert.equal(levelOfHand(emptyTable().options, 100), 1);
});

it("says when the next level begins", () => {
  const level = blindLevelOfHand(withProgression(3, 100), 4);
  assert.deepEqual(level, {
    level: 2,
    blinds: { small: 100, big: 200 },
    next: { blinds: { small: 200, big: 400 }, fromHand: 7 },
  });
  assert.equal(blindLevelOfHand(emptyTable().options, 4).next, null);
});

it("deals each hand at its level, and shows the level in the views", () => {
  const options = withProgression(1, 100);
  let table: Table = {
    ...tableWith([seated("a", { stack: 5000 }), seated("b", { stack: 5000 })]),
    options,
  };
  table = startNextHand(table, deck(["AhAs", "KdKc"], 0));
  assert.equal(table.hand?.betting.bigBlind, 100);
  assert.equal(viewTable(table, SPECTATORS).blindLevel.level, 1);

  const second = startNextHand(
    { ...table, hand: { ...table.hand!, result: { shown: [], awards: [] } } },
    deck(["AhAs", "KdKc"], 0)
  );
  assert.equal(second.hand?.betting.bigBlind, 200);
});

it("refuses a progression without whole hands and percents", () => {
  const problems = (blindProgression: unknown) =>
    optionProblems({
      ...emptyTable().options,
      blindProgression: blindProgression as TableOptions["blindProgression"],
    });
  assert.deepEqual(problems(null), []);
  assert.deepEqual(problems({ everyHands: 10, raisePercent: 50 }), []);
  for (const bad of [
    { everyHands: 0, raisePercent: 50 },
    { everyHands: 10, raisePercent: 0 },
    { everyHands: 1.5, raisePercent: 50 },
    { everyHands: 10, raisePercent: 1001 },
    "fast",
  ]) {
    assert.equal(problems(bad).length, 1, JSON.stringify(bad));
  }
});
