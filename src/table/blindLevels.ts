/**
 * Blind levels (decision 0022): with the table's `blindProgression`, the
 * blinds go up every so many hands. Level 1 is the table's blinds; each level
 * after it raises the big blind by a percentage, rounded to a chip-friendly
 * amount and always above the level before, with the small blind in the
 * table's ratio. A hand's level follows from its number alone, so it needs no
 * state of its own. Without a progression, every hand is level 1.
 */

import type { Blinds } from "../betting/postBlinds.js";
import type { TableOptions } from "./TableOptions.js";

/** The blind level a hand is played at, and when the next begins */
export interface BlindLevel {
  /** From 1 */
  level: number;
  blinds: Blinds;
  /** The next level, if the blinds go up; null without a progression */
  next: { blinds: Blinds; fromHand: number } | null;
}

/** Leading digits of chip-friendly amounts, times a power of ten */
const FRIENDLY = [1, 2, 3, 4, 5, 6, 8, 10];

/** The chip-friendly amount nearest to `amount`, by ratio */
const friendly = (amount: number): number => {
  const scale = 10 ** Math.floor(Math.log10(amount));
  const candidates = FRIENDLY.map((digits) => digits * scale);
  return candidates.reduce((best, candidate) =>
    Math.abs(Math.log(candidate / amount)) < Math.abs(Math.log(best / amount))
      ? candidate
      : best
  );
};

/** The next chip-friendly amount above `amount` */
const friendlyAbove = (amount: number): number => {
  const scale = 10 ** Math.floor(Math.log10(amount));
  const digits = FRIENDLY.find((d) => d * scale > amount)!;
  return digits * scale;
};

/** The blinds at a level, from 1 */
export const blindsAtLevel = (options: TableOptions, level: number): Blinds => {
  const base = options.blinds;
  const progression = options.blindProgression;
  if (!progression || level <= 1) return base;
  const factor = 1 + progression.raisePercent / 100;
  let big = base.big;
  for (let at = 2; at <= level; at++) {
    const target = friendly(base.big * factor ** (at - 1));
    big = target > big ? target : friendlyAbove(big);
  }
  const small = Math.min(
    big,
    Math.max(1, Math.round((big * base.small) / base.big))
  );
  return { small, big };
};

/** The level of the hand with this number, from 1 */
export const levelOfHand = (
  options: TableOptions,
  handNumber: number
): number => {
  const progression = options.blindProgression;
  if (!progression || handNumber < 1) return 1;
  return Math.floor((handNumber - 1) / progression.everyHands) + 1;
};

/** The blind level of the hand with this number */
export const blindLevelOfHand = (
  options: TableOptions,
  handNumber: number
): BlindLevel => {
  const level = levelOfHand(options, handNumber);
  const progression = options.blindProgression;
  return {
    level,
    blinds: blindsAtLevel(options, level),
    next: progression
      ? {
          blinds: blindsAtLevel(options, level + 1),
          fromHand: level * progression.everyHands + 1,
        }
      : null,
  };
};
