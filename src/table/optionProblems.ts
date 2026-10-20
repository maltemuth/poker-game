/**
 * What's wrong with a table's options, as one message per problem; none when
 * they're valid: whole chips, a small blind no bigger than the big blind, a
 * buy-in of at least the big blind, 2 to 10 seats, a known rule for new
 * players, and delays Remote State's timers can take. Creating a table and
 * changing its options both check them.
 */

import { maxDelay, newPlayerRules, type TableOptions } from "./TableOptions.js";

/** @returns One message per problem, empty when the options are valid */
export const optionProblems = (options: TableOptions): string[] => {
  const { blinds, buyIn, seats, newPlayers } = options;
  const { nextHandDelay, turnTimeout, runoutDelay } = options;
  const chips = [blinds.small, blinds.big, buyIn.min, buyIn.max];
  return [
    chips.every((amount) => Number.isInteger(amount) && amount > 0)
      ? null
      : "blinds and buy-ins must be positive whole numbers of chips",
    blinds.small <= blinds.big
      ? null
      : "the small blind can't be bigger than the big blind",
    buyIn.min >= blinds.big
      ? null
      : "the smallest buy-in must be at least the big blind",
    buyIn.max >= buyIn.min
      ? null
      : "the largest buy-in can't be smaller than the smallest",
    Number.isInteger(seats) && seats >= 2 && seats <= 10
      ? null
      : "a table has 2 to 10 seats",
    newPlayerRules.includes(newPlayers)
      ? null
      : `newPlayers must be one of ${newPlayerRules.join(", ")}`,
    nextHandDelay === null ||
    (Number.isInteger(nextHandDelay) &&
      nextHandDelay >= 0 &&
      nextHandDelay <= maxDelay)
      ? null
      : `nextHandDelay must be null or whole milliseconds from 0 to ${maxDelay}`,
    turnTimeout === null ||
    (Number.isInteger(turnTimeout) &&
      turnTimeout >= 1 &&
      turnTimeout <= maxDelay)
      ? null
      : `turnTimeout must be null or whole milliseconds from 1 to ${maxDelay}`,
    runoutDelay === null ||
    (Number.isInteger(runoutDelay) &&
      runoutDelay >= 0 &&
      runoutDelay <= maxDelay)
      ? null
      : `runoutDelay must be null or whole milliseconds from 0 to ${maxDelay}`,
    typeof options.spectatorsSeeHoleCards === "boolean"
      ? null
      : "spectatorsSeeHoleCards must be true or false",
  ].filter((problem) => problem !== null);
};
