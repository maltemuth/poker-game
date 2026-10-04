/**
 * A small seeded random generator for tests (mulberry32), so a failing
 * random run can be repeated with the same seed. Returns numbers from 0 up to
 * but not including 1, like Math.random.
 */

export const random = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
