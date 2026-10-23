/**
 * Tests for the plugin's functions, called directly: joining as a spectator,
 * who may send which actions, the audience changes actions bring, and when
 * the turn runs out.
 */

import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  SYSTEM,
  type Transition,
  type TransitionChanges,
} from "@malte.muth/remote-state";
import { createHoldemPlugin } from "../../src/plugin/createHoldemPlugin.js";
import type { HoldemAction } from "../../src/plugin/HoldemAction.js";
import type { Table } from "../../src/table/Table.js";
import { SPECTATORS } from "../../src/views/audiences.js";
import { viewTable } from "../../src/views/viewTable.js";
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

describe("the turn's deadline", () => {
  let time = 1000;
  let game = createHoldemPlugin();
  beforeEach(() => {
    time = 1000;
    game = createHoldemPlugin({
      draw: deck(["AhAs", "KdKc"], 0),
      now: () => time,
    });
  });
  const act = async (table: Table, action: HoldemAction, playerId: string) =>
    unwrap(await game.executeAction(table, action, playerId)).state;
  /** The player ID of the player to act */
  const toAct = (table: Table): string => {
    const view = viewTable(table, SPECTATORS);
    return view.seats[view.hand!.toAct! - 1]!.playerId;
  };
  const deal = () =>
    act(tableWith([seated("a"), seated("b")]), { type: "startHand" }, SYSTEM);

  it("is set when a hand is dealt, and again for every new turn", async () => {
    const dealt = await deal();
    assert.equal(dealt.turnDeadline, 31000);
    assert.equal(viewTable(dealt, "a").turnDeadline, 31000);
    time = 5000;
    const called = await act(dealt, { type: "call" }, toAct(dealt));
    assert.equal(called.turnDeadline, 35000);
  });

  it("stays for an action that doesn't begin a new turn", async () => {
    const dealt = await deal();
    time = 5000;
    const sat = await act(
      { ...dealt, spectators: [{ playerId: "e", name: "e" }] },
      { type: "sitDown", seat: 5, buyIn: 1000 },
      "e"
    );
    assert.equal(sat.turnDeadline, 31000);
  });

  it("is cleared when no one is to act", async () => {
    const dealt = await deal();
    const over = await act(dealt, { type: "fold" }, toAct(dealt));
    assert.equal(over.turnDeadline, null);
  });

  it("is never set without a turn timeout", async () => {
    const untimed = await act(
      tableWith([seated("a"), seated("b")], {
        options: { ...emptyTable().options, turnTimeout: null },
      }),
      { type: "startHand" },
      SYSTEM
    );
    assert.equal(untimed.turnDeadline, null);
  });

  it("is cleared by a restart, and starts over when the host resumes", async () => {
    const interrupted = game.onRestart!(await deal()) as Table;
    assert.equal(interrupted.turnDeadline, null);
    time = 90000;
    const resumed = await act(interrupted, { type: "resume" }, SYSTEM);
    assert.equal(resumed.turnDeadline, 120000);
  });
});

describe("pausing during a hand", () => {
  let time = 1000;
  let game = createHoldemPlugin();
  beforeEach(() => {
    time = 1000;
    game = createHoldemPlugin({
      draw: deck(["AhAs", "KdKc"], 0),
      now: () => time,
    });
  });
  const run = async (table: Table, action: HoldemAction, playerId: string) =>
    unwrap(await game.executeAction(table, action, playerId));
  const deal = async () =>
    (
      await run(
        tableWith([seated("a"), seated("b")]),
        { type: "startHand" },
        SYSTEM
      )
    ).state;

  it("stops the turn's timer, and keeps the time it had left", async () => {
    const dealt = await deal();
    time = 11000;
    const { state, changes } = await run(dealt, { type: "pause" }, SYSTEM);
    assert.deepEqual(changes.cancel, ["turn"]);
    assert.equal(state.turnDeadline, null);
    assert.equal(state.turnTimeLeft, 20000);
    const view = viewTable(state, "a");
    assert.equal(view.turnTimeLeft, 20000);
    assert.deepEqual(view.you?.buttons, []);
  });

  it("gives the turn the time it had left when the host resumes", async () => {
    const dealt = await deal();
    time = 11000;
    const paused = (await run(dealt, { type: "pause" }, SYSTEM)).state;
    time = 500000;
    const { state, changes } = await run(paused, { type: "resume" }, SYSTEM);
    assert.deepEqual(changes.schedule, [
      {
        name: "turn",
        in: 20000,
        action: { type: "timeout", hand: 1, turn: 0 },
      },
    ]);
    assert.equal(state.turnDeadline, 520000);
    assert.equal(state.turnTimeLeft, null);
  });

  it("keeps the time left across a restart, which has no timer to interrupt", async () => {
    const dealt = await deal();
    time = 11000;
    const paused = (await run(dealt, { type: "pause" }, SYSTEM)).state;
    assert.equal(game.onRestart!(paused), paused);
    time = 90000;
    const resumed = (await run(paused, { type: "resume" }, SYSTEM)).state;
    assert.equal(resumed.turnDeadline, 110000);
  });

  it("keeps no time left when paused between hands", async () => {
    const { state } = await run(
      tableWith([seated("a"), seated("b")]),
      { type: "pause" },
      SYSTEM
    );
    assert.equal(state.turnTimeLeft, null);
  });
});

describe("changing the options", () => {
  const two = tableWith([seated("a"), seated("b")]);
  const changes = (table: Table, options: object) =>
    plugin.executeAction(
      table,
      { type: "setOptions", options } as HoldemAction,
      SYSTEM
    );

  it("lets only the host change them", async () => {
    const action = { type: "setOptions", options: {} } as const;
    assert.equal(
      await plugin.validateAction(two, action, "a"),
      "Only the host can do that"
    );
    assert.equal(await plugin.validateAction(two, action, SYSTEM), true);
  });

  it("starts the next hand's timer over with a new delay", async () => {
    const { state, changes: timers } = unwrap(
      await changes(two, { nextHandDelay: 1000 })
    );
    assert.equal(state.options.nextHandDelay, 1000);
    assert.deepEqual(timers.schedule, [
      { name: "nextHand", in: 1000, action: { type: "startHand" } },
    ]);
  });

  it("cancels it when hands are left to the host, or can't start yet", async () => {
    const toHost = unwrap(await changes(two, { nextHandDelay: null }));
    assert.deepEqual(toHost.changes.cancel, ["nextHand"]);
    const alone = unwrap(
      await changes(tableWith([seated("a")]), { turnTimeout: 5000 })
    );
    assert.deepEqual(alone.changes.cancel, ["nextHand"]);
  });
});
