/**
 * Tests for the runout timer: scheduled for each step of a paced all-in
 * runout, cancelled when the hand stops waiting.
 */

import { applySystemAction } from "../../src/plugin/systemActions.js";
import { RUNOUT, runoutTimer } from "../../src/plugin/runoutTimer.js";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import type { Table } from "../../src/table/Table.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const step = (board: number) => ({
  schedule: [
    { name: RUNOUT, in: 500, action: { type: "runout", hand: 1, board } },
  ],
});

const allIn = (runoutDelay: number | null) => {
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c");
  const table: Table = tableWith([seated("a"), seated("b")], {
    options: { ...emptyTable().options, runoutDelay },
  });
  let playing = applySystemAction(table, { type: "startHand" }, draw);
  playing = applyTableAction(playing, "a", { type: "allIn" }, draw);
  const called = applyTableAction(playing, "b", { type: "call" }, draw);
  return { playing, called, draw };
};

it("schedules each step of the runout, and cancels it at the end", () => {
  const { playing, called, draw } = allIn(500);
  expect(runoutTimer(playing, called)).toEqual(step(0));
  const flop = applySystemAction(
    called,
    { type: "runout", hand: 1, board: 0 },
    draw
  );
  expect(runoutTimer(called, flop)).toEqual(step(3));
  const turn = applySystemAction(
    flop,
    { type: "runout", hand: 1, board: 3 },
    draw
  );
  const river = applySystemAction(
    turn,
    { type: "runout", hand: 1, board: 4 },
    draw
  );
  expect(river.hand?.result).not.toBeNull();
  expect(runoutTimer(turn, river)).toEqual({ cancel: [RUNOUT] });
});

it("schedules nothing when the runout is dealt at once", () => {
  const { playing, called } = allIn(null);
  expect(called.hand?.result).not.toBeNull();
  expect(runoutTimer(playing, called)).toEqual({});
});
