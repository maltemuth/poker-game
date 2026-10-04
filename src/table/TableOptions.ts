/**
 * A table's settings, chosen by the host when it creates the table: the
 * blinds, the buy-in range, the number of seats, and how new players join a
 * running game (decision 0006).
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
}

export const newPlayerRules: readonly NewPlayerRule[] = [
  "nextHand",
  "waitForBigBlind",
  "postBigBlind",
];
