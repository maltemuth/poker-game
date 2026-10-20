/**
 * Drawing cards at random, for real hands: every card still out is equally
 * likely, from the Web Crypto API's cryptographically secure random numbers,
 * which Node.js and browsers both have, so the package loads in either.
 */

import type { Draw } from "./Draw.js";

const RANGE = 2 ** 32;

/**
 * A whole number from 0 up to `max`, excluded, every one equally likely:
 * random 32-bit numbers from the top, incomplete run of `max` values are
 * drawn again, so none of the results comes up more often.
 */
export const randomBelow = (max: number): number => {
  const limit = RANGE - (RANGE % max);
  const value = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(value);
  } while (value[0] >= limit);
  return value[0] % max;
};

export const randomDraw: Draw = (out) => out[randomBelow(out.length)];
