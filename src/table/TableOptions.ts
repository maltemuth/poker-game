/**
 * A table's settings, chosen by the host when it creates the table, and
 * changeable until the first hand (decision 0020): the
 * blinds, the buy-in range, the number of seats, how new players join a
 * running game (decision 0006), how soon hands start (decision 0013), how
 * long a turn may take (decision 0014), how an all-in runout is dealt
 * (decision 0015), whether spectators see the hole cards (decision 0016),
 * and how the blinds go up (decision 0022).
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
  /** Milliseconds a player has to act before they fold (decision 0014); null for no limit */
  turnTimeout: number | null;
  /**
   * Milliseconds between the betting rounds' cards of an all-in runout
   * (decision 0015); null to deal the rest of the board at once
   */
  runoutDelay: number | null;
  /** Spectators see every hole card during the hand (decision 0016) */
  spectatorsSeeHoleCards: boolean;
  /**
   * The blinds go up every `everyHands` hands, by `raisePercent` per level,
   * rounded to chip-friendly amounts (decision 0022); null to keep them
   */
  blindProgression: BlindProgression | null;
}

/** How the blinds go up (decision 0022) */
export interface BlindProgression {
  /** Hands per level, from 1 */
  everyHands: number;
  /** How much each level raises the big blind, in whole percent from 1 to 1000 */
  raisePercent: number;
}

/** The longest delay Remote State's timers take: about 24.8 days */
export const maxDelay = 2 ** 31 - 1;

export const newPlayerRules: readonly NewPlayerRule[] = [
  "nextHand",
  "waitForBigBlind",
  "postBigBlind",
];
