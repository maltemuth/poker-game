/**
 * A table's settings, chosen by the host when it creates the table: the
 * blinds, the buy-in range, the number of seats, how new players join a
 * running game (decision 0006), and how soon hands start (decision 0013).
 */

import type { Blinds } from "../betting/postBlinds.js";

/** How a player who sits down while a game is running is dealt in */
export type NewPlayerRule = "nextHand" | "waitForBigBlind" | "postBigBlind";

export interface TableOptions {
  blinds: Blinds;
  /** The chips a player may sit down with, inclusive */
  buyIn: { min: number; max: number };
  /** The number of seats, 2 to 10 */
  seats: number;
  newPlayers: NewPlayerRule;
  /**
   * Milliseconds from the moment a hand can start until it does (decision
   * 0013); null to leave starting hands to the host
   */
  nextHandDelay: number | null;
}

/** The longest delay Remote State's timers take: about 24.8 days */
export const maxDelay = 2 ** 31 - 1;

export const newPlayerRules: readonly NewPlayerRule[] = [
  "nextHand",
  "waitForBigBlind",
  "postBigBlind",
];
