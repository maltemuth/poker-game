/**
 * Texas Hold'em as a Remote State game: a thin layer over the table's rules.
 *
 * - The host creates each game with a table from `newTable`.
 * - Everyone admitted joins as a spectator, named by the `name` the host
 *   passed, and gets the spectators' view.
 * - Players' actions are the table's; the system's are starting a hand,
 *   pausing and resuming (decision 0012).
 * - Each audience's view is `viewTable` (decision 0005 for shown hands).
 * - Hands start by themselves, by the `nextHand` timer (decision 0013).
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
import { nextHandTimer } from "./nextHandTimer.js";
import { type HoldemAction, isSystemAction } from "./HoldemAction.js";
import { applySystemAction, checkSystemAction } from "./systemActions.js";

export interface HoldemPluginOptions {
  /** How cards are drawn; `randomDraw` unless given */
  draw?: Draw;
}

export type HoldemPlugin = GamePlugin<Table, HoldemAction, TableView>;

const nameFrom = (details: Record<string, unknown>): string =>
  typeof details.name === "string" && details.name.trim()
    ? details.name.trim()
    : "Player";

export const createHoldemPlugin = ({
  draw = randomDraw,
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

  executeAction: (table, action, playerId) => {
    // validateAction let system actions through only from the system
    const after = isSystemAction(action)
      ? applySystemAction(table, action, draw)
      : applyTableAction(table, playerId, action, draw);
    const audiences = audienceChanges(table, after);
    const dealt = isSystemAction(action) && action.type === "startHand";
    const timers = nextHandTimer(table, after, dealt);
    return Object.keys(audiences).length > 0 || timers.schedule || timers.cancel
      ? transition(after, { audiences, ...timers })
      : after;
  },

  filterStateForAudience: (table, audience) => viewTable(table, audience),

  gameConfig: {
    name: "Texas Hold'em",
    description: "No-limit Texas Hold'em cash tables",
  },
});
