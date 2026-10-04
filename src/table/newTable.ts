/**
 * An empty table with the host's options, checked: whole chips, a small blind
 * no bigger than the big blind, a buy-in of at least the big blind, and 2 to
 * 10 seats. New players are dealt in from the next hand unless the options
 * say otherwise (decision 0006).
 */

import type { Table } from "./Table.js";
import { newPlayerRules, type TableOptions } from "./TableOptions.js";

export type TableOptionsInput = Omit<TableOptions, "newPlayers"> &
  Partial<Pick<TableOptions, "newPlayers">>;

const problemsWith = (options: TableOptions): string[] => {
  const { blinds, buyIn, seats, newPlayers } = options;
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
  ].filter((problem) => problem !== null);
};

/**
 * @throws {Error} If the options are invalid, naming every problem
 */
export const newTable = (input: TableOptionsInput): Table => {
  const options: TableOptions = { newPlayers: "nextHand", ...input };
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
  };
};
