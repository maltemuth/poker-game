/**
 * Tests for the turn timer: scheduled for every new turn, left alone by
 * actions that don't begin one, cancelled when no one is to act.
 */

import { applySystemAction } from "../../src/plugin/systemActions.js";
import { TURN, turnTimer } from "../../src/plugin/turnTimer.js";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import type { Table } from "../../src/table/Table.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const timeoutFor = (hand: number, turn: number, delay = 30000) => ({
  schedule: [
    { name: TURN, in: delay, action: { type: "timeout", hand, turn } },
  ],
});

const draw = () => deck(["AhAs", "KdKc", "QhQs"], 0, "2c7d9h");
const three = tableWith([seated("a"), seated("b"), seated("c")]);

it("schedules a timeout when a hand is dealt, and for every new turn", () => {
  const d = draw();
  const dealt = applySystemAction(three, { type: "startHand" }, d);
  expect(turnTimer(three, dealt)).toEqual(timeoutFor(1, 0));
  const called = applyTableAction(dealt, "a", { type: "call" }, d);
  expect(turnTimer(dealt, called)).toEqual(timeoutFor(1, 1));
});

it("leaves the timer alone for a fold out of turn, or someone sitting down", () => {
  const d = draw();
  const dealt: Table = {
    ...applySystemAction(three, { type: "startHand" }, d),
    spectators: [{ playerId: "e", name: "e" }],
  };
  const onBreak = applyTableAction(dealt, "c", { type: "standUp" }, d);
  expect(onBreak.hand?.betting.seats[2].folded).toBe(true);
  expect(turnTimer(dealt, onBreak)).toEqual({});
  const sat = applyTableAction(
    dealt,
    "e",
    { type: "sitDown", seat: 5, buyIn: 1000 },
    d
  );
  expect(turnTimer(dealt, sat)).toEqual({});
});

it("cancels it when no one is to act any more", () => {
  const d = deck(["AhAs", "KdKc"], 0);
  const dealt = applySystemAction(
    tableWith([seated("a"), seated("b")]),
    { type: "startHand" },
    d
  );
  const over = applyTableAction(dealt, "a", { type: "fold" }, d);
  expect(turnTimer(dealt, over)).toEqual({ cancel: [TURN] });
});

it("uses the table's timeout, and never schedules without one", () => {
  const withTimeout = (turnTimeout: number | null): Table => ({
    ...three,
    options: { ...emptyTable().options, turnTimeout },
  });
  const short = withTimeout(250);
  expect(
    turnTimer(short, applySystemAction(short, { type: "startHand" }, draw()))
  ).toEqual(timeoutFor(1, 0, 250));
  const none = withTimeout(null);
  expect(
    turnTimer(none, applySystemAction(none, { type: "startHand" }, draw()))
  ).toEqual({});
});
