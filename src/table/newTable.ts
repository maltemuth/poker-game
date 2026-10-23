/**
 * An empty table with the host's options, checked: whole chips, a small blind
 * no bigger than the big blind, a buy-in of at least the big blind, and 2 to
 * 10 seats. Unless the options say otherwise, new players are dealt in from
 * the next hand (decision 0006), hands start 5 seconds after they can
 * (decision 0013), a player has 30 seconds to act (decision 0014), an
 * all-in runout deals a betting round's cards every 2 seconds (decision
 * 0015), spectators see no hole cards (decision 0016), and the blinds stay
 * as they are (decision 0022).
 */

import type { Table } from "./Table.js";
import { optionProblems } from "./optionProblems.js";
import type { TableOptions } from "./TableOptions.js";

type Defaulted =
  | "newPlayers"
  | "nextHandDelay"
  | "turnTimeout"
  | "runoutDelay"
  | "spectatorsSeeHoleCards"
  | "blindProgression";

export type TableOptionsInput = Omit<TableOptions, Defaulted> &
  Partial<Pick<TableOptions, Defaulted>>;

/**
 * @throws {Error} If the options are invalid, naming every problem
 */
export const newTable = (input: TableOptionsInput): Table => {
  const options: TableOptions = {
    newPlayers: "nextHand",
    nextHandDelay: 5000,
    turnTimeout: 30000,
    runoutDelay: 2000,
    spectatorsSeeHoleCards: false,
    blindProgression: null,
    // an option given as undefined keeps its default
    ...(Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined)
    ) as TableOptionsInput),
  };
  const problems = optionProblems(options);
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
    interrupted: false,
    turnDeadline: null,
    turnTimeLeft: null,
    handNumber: 0,
  };
};
