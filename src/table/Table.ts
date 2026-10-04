/**
 * The state of a table: its options, who is watching, who sits where with
 * how many chips, the last button, the hand being played or the last one,
 * and whether it's paused. It's plain JSON. Players are identified by the ID the host gives them;
 * in Remote State, that's the player ID.
 */

import type { Hand } from "../hand/Hand.js";
import type { TableOptions } from "./TableOptions.js";

export interface Person {
  playerId: string;
  name: string;
}

export interface SeatedPlayer extends Person {
  /**
   * Chips between hands. During a hand, the chips of a player dealt in are in
   * the hand's betting, and this is what they started it with.
   */
  stack: number;
  /** On a break: not dealt in until they sit in again */
  sittingOut: boolean;
  /** Sat down while a game was running; dealt in by the table's `newPlayers` rule */
  newPlayer: boolean;
  /** Leaves the table when the hand they're in is over */
  leaving: boolean;
}

export interface Table {
  options: TableOptions;
  /** People at the table without a seat */
  spectators: Person[];
  /** One entry per seat, the seat number being the index plus one; null when empty */
  seats: (SeatedPlayer | null)[];
  /** Index into `seats` of the last hand's button; null before the first hand */
  button: number | null;
  /** The hand being played, or the last one; null before the first hand */
  hand: Hand | null;
  /** No new hands are dealt while it's paused (decision 0012) */
  paused: boolean;
}
