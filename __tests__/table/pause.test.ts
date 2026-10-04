/**
 * Tests for pausing a table: no new hands while paused, and resuming.
 */

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
  expect(checkStartHand(paused)).toBe("The table is paused");
  expect(checkStartHand(resume(paused))).toBe(true);
});

it("refuses to pause twice, or resume a table that isn't paused", () => {
  expect(checkPause(pause(table))).toBe("The table is already paused");
  expect(checkResume(table)).toBe("The table isn't paused");
});
