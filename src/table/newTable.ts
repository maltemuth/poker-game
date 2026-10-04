/**
 * An empty table with the host's options, checked: whole chips, a small blind
 * no bigger than the big blind, a buy-in of at least the big blind, and 2 to
 * 10 seats. Unless the options say otherwise, new players are dealt in from
 * the next hand (decision 0006), and hands start 5 seconds after they can
 * (decision 0013).
 */

import type { Table } from "./Table.js";
import { maxDelay, newPlayerRules, type TableOptions } from "./TableOptions.js";

export type TableOptionsInput = Omit<
  TableOptions,
  "newPlayers" | "nextHandDelay"
> &
  Partial<Pick<TableOptions, "newPlayers" | "nextHandDelay">>;

const problemsWith = (options: TableOptions): string[] => {
  const { blinds, buyIn, seats, newPlayers, nextHandDelay } = options;
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
  ].filter((problem) => problem !== null);
};

/**
 * @throws {Error} If the options are invalid, naming every problem
 */
export const newTable = (input: TableOptionsInput): Table => {
  const options: TableOptions = {
    newPlayers: "nextHand",
    nextHandDelay: 5000,
    ...input,
  };
  const problems = problemsWith(options);
  if (problems.length > 0) {
    throw new Error(`Invalid table options: ${problems.join("; ")}`);
  }
  return {
    options,
    spectators: [],
    seats: Array.from({ length: options.seats }, () => null),
    button: null,
    hand: null,
    paused: false,
  };
};
