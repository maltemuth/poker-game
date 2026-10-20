/**
 * Texas Hold'em as a Remote State game: a thin layer over the table's rules.
 *
 * - The host creates each game with a table from `newTable`.
 * - Everyone admitted joins as a spectator, named by the `name` the host
 *   passed, and gets the spectators' view.
 * - Players' actions are the table's; the system's are starting a hand,
 *   pausing and resuming (decision 0012).
 * - Each audience's view is `viewTable` (decision 0005 for shown hands).
 * - Hands start by themselves, by the `nextHand` timer (decision 0013), and
 *   a turn that runs out folds, by the `turn` timer (decision 0014).
 * - An all-in runout is dealt one betting round at a time, by the `runout`
 *   timer (decision 0015).
 * - After a server restart, a table that had a timer running is interrupted
 *   until the host resumes it, which schedules its timers again (decision 0018).
 *
 * Cards are drawn with `draw`, at random by default; tests pass a fixed deck.
 */

import { type GamePlugin, SYSTEM, transition } from "@malte.muth/remote-state";
import type { Draw } from "../hand/Draw.js";
import { randomDraw } from "../hand/randomDraw.js";
import { addSpectator } from "../table/addSpectator.js";
import { applyTableAction } from "../table/applyTableAction.js";
import { checkTableAction } from "../table/checkTableAction.js";
import type { Table } from "../table/Table.js";
import { SPECTATORS } from "../views/audiences.js";
import type { TableView } from "../views/TableView.js";
import { viewTable } from "../views/viewTable.js";
import { audienceChanges } from "./audienceChanges.js";
import { nextHandTimer, nextHandTimerForNewOptions } from "./nextHandTimer.js";
import { onRestart, timersFor } from "./restart.js";
import { runoutTimer } from "./runoutTimer.js";
import { turnDeadline, turnTimer } from "./turnTimer.js";
import { type HoldemAction, isSystemAction } from "./HoldemAction.js";
import { applySystemAction, checkSystemAction } from "./systemActions.js";

export interface HoldemPluginOptions {
  /** How cards are drawn; `randomDraw` unless given */
  draw?: Draw;
  /** The time, in milliseconds since the epoch, for turn deadlines; `Date.now` unless given */
  now?: () => number;
}

export type HoldemPlugin = GamePlugin<Table, HoldemAction, TableView>;

const nameFrom = (details: Record<string, unknown>): string =>
  typeof details.name === "string" && details.name.trim()
    ? details.name.trim()
    : "Player";

export const createHoldemPlugin = ({
  draw = randomDraw,
  now = Date.now,
}: HoldemPluginOptions = {}): HoldemPlugin => ({
  onJoin: (table, { playerId, details }) =>
    transition(addSpectator(table, { playerId, name: nameFrom(details) }), {
      audiences: { [playerId]: SPECTATORS },
    }),

  validateAction: (table, action, playerId) => {
    if (playerId === SYSTEM) {
      return isSystemAction(action)
        ? checkSystemAction(table, action)
        : "The system can't act for a player";
    }
    if (isSystemAction(action)) return "Only the host can do that";
    return checkTableAction(table, playerId, action);
  },

  onRestart,

  executeAction: (table, action, playerId) => {
    // validateAction let system actions through only from the system
    const after = isSystemAction(action)
      ? applySystemAction(table, action, draw)
      : applyTableAction(table, playerId, action, draw);
    // No timer survived the restart, so every one the table calls for starts over
    if (table.interrupted && !after.interrupted) {
      const schedule = timersFor(after);
      const deadline = turnDeadline(after, { schedule }, now());
      return transition({ ...after, turnDeadline: deadline }, { schedule });
    }
    const audiences = audienceChanges(table, after);
    const dealt = isSystemAction(action) && action.type === "startHand";
    const turn = turnTimer(table, after);
    const timers = [
      isSystemAction(action) && action.type === "setOptions"
        ? nextHandTimerForNewOptions(after)
        : nextHandTimer(table, after, dealt),
      turn,
      runoutTimer(table, after),
    ];
    const deadline = turnDeadline(after, turn, now());
    const state =
      deadline === after.turnDeadline
        ? after
        : { ...after, turnDeadline: deadline };
    const schedule = timers.flatMap((timer) => timer.schedule ?? []);
    const cancel = timers.flatMap((timer) => timer.cancel ?? []);
    return Object.keys(audiences).length > 0 || schedule.length || cancel.length
      ? transition(state, { audiences, schedule, cancel })
      : state;
  },

  filterStateForAudience: (table, audience) => viewTable(table, audience),
});
