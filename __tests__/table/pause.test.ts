/**
 * Tests for pausing a table: no new hands while paused, and resuming.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import {
  checkPause,
  checkResume,
  pause,
  resume,
} from "../../src/table/pause.js";
import { checkStartHand } from "../../src/table/startNextHand.js";
import { seated, tableWith } from "../helpers/table.js";

const table = tableWith([seated("a"), seated("b")]);

it("deals no new hands while paused", () => {
  const paused = pause(table);
  assert.equal(checkStartHand(paused), "The table is paused");
  assert.equal(checkStartHand(resume(paused)), true);
});

it("refuses to pause twice, or resume a table that isn't paused", () => {
  assert.equal(checkPause(pause(table)), "The table is already paused");
  assert.equal(checkResume(table), "The table isn't paused");
});
