/**
 * Tests for the plugin's functions, called directly: joining as a spectator,
 * who may send which actions, and the audience changes actions bring.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import {
  SYSTEM,
  type Transition,
  type TransitionChanges,
} from "@malte.muth/remote-state";
import { createHoldemPlugin } from "../../src/plugin/createHoldemPlugin.js";
import type { Table } from "../../src/table/Table.js";
import { SPECTATORS } from "../../src/views/audiences.js";
import { deck } from "../helpers/hand.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const plugin = createHoldemPlugin({ draw: deck(["AhAs", "KdKc"], 0) });

/** The state and changes a plugin function returned, plain or as a transition */
const unwrap = (
  result: unknown
): { state: Table; changes: TransitionChanges } =>
  result && typeof result === "object" && "changes" in result
    ? (result as Transition<Table>)
    : { state: result as Table, changes: {} };

it("adds everyone who joins as a spectator, in the spectators' audience", async () => {
  const { state, changes } = unwrap(
    await plugin.onJoin!(emptyTable(), {
      playerId: "p1",
      details: { name: " Ann " },
    })
  );
  assert.deepEqual(state.spectators, [{ playerId: "p1", name: "Ann" }]);
  assert.deepEqual(changes.audiences, { p1: SPECTATORS });
});

it("names someone without a name Player", async () => {
  const { state } = unwrap(
    await plugin.onJoin!(emptyTable(), { playerId: "p1", details: {} })
  );
  assert.equal(state.spectators[0].name, "Player");
});

it("lets only the system start hands, pause and resume", async () => {
  const table = tableWith([seated("a"), seated("b")]);
  assert.equal(
    await plugin.validateAction(table, { type: "startHand" }, SYSTEM),
    true
  );
  assert.equal(
    await plugin.validateAction(table, { type: "startHand" }, "a"),
    "Only the host can do that"
  );
  assert.equal(
    await plugin.validateAction(table, { type: "sitIn" }, SYSTEM),
    "The system can't act for a player"
  );
  assert.equal(
    await plugin.validateAction(table, { type: "resume" }, SYSTEM),
    "The table isn't paused"
  );
});

it("passes players' actions to the table's rules", async () => {
  const table = tableWith([seated("a")]);
  assert.equal(
    await plugin.validateAction(table, { type: "sitIn" }, "a"),
    "You aren't on a break"
  );
  assert.equal(
    await plugin.validateAction(table, { type: "nonsense" } as never, "a"),
    "Unknown action"
  );
});

it("moves a player who sits down to their own audience, and back when they leave", async () => {
  const watching: Table = {
    ...emptyTable(),
    spectators: [{ playerId: "a", name: "Ann" }],
  };
  const sat = unwrap(
    await plugin.executeAction(
      watching,
      { type: "sitDown", seat: 1, buyIn: 1000 },
      "a"
    )
  );
  assert.deepEqual(sat.changes.audiences, { a: null });
  const left = unwrap(
    await plugin.executeAction(sat.state, { type: "leave" }, "a")
  );
  assert.deepEqual(left.changes.audiences, { a: SPECTATORS });
});

it("moves a player who runs out of chips to the spectators", async () => {
  const draw = deck(["AhAs", "KdKc"], 0, "2c7d9hJs3c");
  const game = createHoldemPlugin({ draw });
  let table = unwrap(
    await game.executeAction(
      tableWith([seated("a"), seated("b")]),
      { type: "startHand" },
      SYSTEM
    )
  ).state;
  table = unwrap(await game.executeAction(table, { type: "allIn" }, "a")).state;
  const called = unwrap(await game.executeAction(table, { type: "call" }, "b"));
  // a's aces beat b's kings; b has nothing left
  assert.deepEqual(called.changes.audiences, { b: SPECTATORS });
});

it("filters the state with viewTable", async () => {
  const table = tableWith([seated("a"), seated("b")]);
  const view = await plugin.filterStateForAudience!(table, SPECTATORS);
  assert.equal(view.you, null);
  assert.equal(view.seats[0]?.name, "a");
});

it("accepts a timeout only from the system, for the current turn", async () => {
  const draw = deck(["AhAs", "KdKc"], 0);
  const game = createHoldemPlugin({ draw });
  const table = unwrap(
    await game.executeAction(
      tableWith([seated("a"), seated("b")]),
      { type: "startHand" },
      SYSTEM
    )
  ).state;
  const timeout = { type: "timeout", hand: 1, turn: 0 } as const;
  assert.equal(
    await game.validateAction(table, timeout, "a"),
    "Only the host can do that"
  );
  assert.equal(await game.validateAction(table, timeout, SYSTEM), true);
  assert.equal(
    await game.validateAction(table, { ...timeout, turn: 1 }, SYSTEM),
    "That turn is over"
  );
});
