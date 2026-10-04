/**
 * Tests for the nextHand timer: scheduled when a hand becomes startable,
 * cancelled when it stops being so, and left alone otherwise.
 */

import { applySystemAction } from "../../src/plugin/systemActions.js";
import { NEXT_HAND, nextHandTimer } from "../../src/plugin/nextHandTimer.js";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import type { Table } from "../../src/table/Table.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const scheduled = (delay = 5000) => ({
  schedule: [{ name: NEXT_HAND, in: delay, action: { type: "startHand" } }],
});
const cancelled = { cancel: [NEXT_HAND] };

const twoSeated = tableWith([seated("a"), seated("b")]);

it("schedules the next hand when the second player sits down", () => {
  const one = tableWith([seated("a")], {
    spectators: [{ playerId: "b", name: "b" }],
  });
  const two = applyTableAction(
    one,
    "b",
    { type: "sitDown", seat: 2, buyIn: 1000 },
    deck([], 0)
  );
  expect(nextHandTimer(one, two, false)).toEqual(scheduled());
});

it("leaves a pending timer alone when a third player sits down", () => {
  const waiting: Table = {
    ...twoSeated,
    spectators: [{ playerId: "c", name: "c" }],
  };
  const three = applyTableAction(
    waiting,
    "c",
    { type: "sitDown", seat: 3, buyIn: 1000 },
    deck([], 0)
  );
  expect(nextHandTimer(waiting, three, false)).toEqual({});
});

it("cancels it when a hand starts, and schedules it when the hand is over", () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const playing = applySystemAction(twoSeated, { type: "startHand" }, draw);
  expect(nextHandTimer(twoSeated, playing, true)).toEqual(cancelled);
  const over = applyTableAction(playing, "a", { type: "fold" }, draw);
  expect(nextHandTimer(playing, over, false)).toEqual(scheduled());
});

it("schedules it again when the blinds play a hand out at once", () => {
  const short = tableWith([
    seated("a", { stack: 50 }),
    seated("b", { stack: 100 }),
  ]);
  const played = applySystemAction(
    short,
    { type: "startHand" },
    deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c")
  );
  expect(played.hand?.result).not.toBeNull();
  expect(nextHandTimer(short, played, true)).toEqual(scheduled());
});

it("cancels it when the table is paused or players leave, and schedules it on resume", () => {
  const paused = applySystemAction(twoSeated, { type: "pause" }, deck([], 0));
  expect(nextHandTimer(twoSeated, paused, false)).toEqual(cancelled);
  const resumed = applySystemAction(paused, { type: "resume" }, deck([], 0));
  expect(nextHandTimer(paused, resumed, false)).toEqual(scheduled());
  const alone = applyTableAction(
    twoSeated,
    "b",
    { type: "leave" },
    deck([], 0)
  );
  expect(nextHandTimer(twoSeated, alone, false)).toEqual(cancelled);
});

it("uses the table's delay, and never schedules without one", () => {
  const one = (nextHandDelay: number | null) => ({
    ...tableWith([seated("a")]),
    options: { ...emptyTable().options, nextHandDelay },
  });
  const two = (table: Table): Table => ({ ...table, seats: twoSeated.seats });
  expect(nextHandTimer(one(250), two(one(250)), false)).toEqual(scheduled(250));
  expect(nextHandTimer(one(null), two(one(null)), false)).toEqual({});
});
