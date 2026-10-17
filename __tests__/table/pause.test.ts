/**
 * Tests for pausing a table: no new hands while paused; interrupting it:
 * nothing happens at all; and resuming.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { checkTableAction } from "../../src/table/checkTableAction.js";
import {
  checkPause,
  checkResume,
  INTERRUPTED,
  interrupt,
  pause,
  resume,
} from "../../src/table/pause.js";
import { checkRunout } from "../../src/table/runout.js";
import {
  checkStartHand,
  startNextHand,
} from "../../src/table/startNextHand.js";
import { checkTimeOut, currentTurn } from "../../src/table/timeOut.js";
import { deck } from "../helpers/hand.js";
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

it("lets nothing happen at an interrupted table", () => {
  const d = deck(["AhAs", "KdKc"], 0, "2c7d9h");
  const dealt = startNextHand(table, d);
  const interrupted = interrupt(dealt);
  assert.equal(
    checkTableAction(interrupted, "a", { type: "call" }),
    INTERRUPTED
  );
  assert.equal(
    checkTableAction(interrupted, "b", { type: "leave" }),
    INTERRUPTED
  );
  assert.equal(checkTimeOut(interrupted, currentTurn(dealt)!), INTERRUPTED);
  assert.equal(checkRunout(interrupted, { hand: 1, board: 0 }), INTERRUPTED);
  assert.equal(checkStartHand(interrupt(table)), INTERRUPTED);
  // the same table, resumed, carries on
  assert.equal(
    checkTableAction(resume(interrupted), "a", { type: "call" }),
    true
  );
});

it("ends an interruption first when resuming, and a pause after that", () => {
  const both = interrupt(pause(table));
  assert.equal(checkResume(both), true);
  const once = resume(both);
  assert.deepEqual([once.interrupted, once.paused], [false, true]);
  const twice = resume(once);
  assert.deepEqual([twice.interrupted, twice.paused], [false, false]);
  assert.equal(checkResume(twice), "The table isn't paused");
});
