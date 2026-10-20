/**
 * The host changes a table's options until its first hand is dealt (decision
 * 0020): any option but the number of seats, checked like a new table's.
 * Options left out keep their values. Chips already on the table stay as they
 * are, also where a new buy-in range wouldn't allow them.
 */

import { optionProblems } from "./optionProblems.js";
import type { Table } from "./Table.js";
import type { TableOptions } from "./TableOptions.js";

/** New values for some of a table's options */
export type OptionChanges = Partial<Omit<TableOptions, "seats">>;

export interface SetOptions {
  type: "setOptions";
  options: OptionChanges;
}

/** The table's options with the changes made; unknown keys and undefined values are ignored */
const changed = (table: Table, changes: OptionChanges): TableOptions => {
  const options = { ...table.options };
  for (const key of Object.keys(options) as (keyof TableOptions)[]) {
    const value = changes[key as keyof OptionChanges];
    if (key !== "seats" && value !== undefined) {
      (options as Record<string, unknown>)[key] = value;
    }
  }
  return options;
};

export const checkSetOptions = (
  table: Table,
  { options }: SetOptions
): true | string => {
  if (table.handNumber > 0) {
    return "The options can't change once a hand has been dealt";
  }
  if (typeof options !== "object" || options === null) {
    return "The options to change are missing";
  }
  if ("seats" in options && options.seats !== table.options.seats) {
    return "A table's seats can't change";
  }
  const problems = optionProblems(changed(table, options));
  return problems.length > 0
    ? `Invalid table options: ${problems.join("; ")}`
    : true;
};

/**
 * @throws {Error} If `checkSetOptions` refuses
 */
export const setOptions = (table: Table, action: SetOptions): Table => {
  const accepted = checkSetOptions(table, action);
  if (accepted !== true) throw new Error(accepted);
  return { ...table, options: changed(table, action.options) };
};
