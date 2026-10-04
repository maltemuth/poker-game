/**
 * Tests for someone arriving at the table as a spectator.
 */

import { addSpectator } from "../../src/table/addSpectator.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const ann = { playerId: "ann", name: "Ann" };

it("adds someone new as a spectator", () => {
  expect(addSpectator(emptyTable(), ann).spectators).toEqual([ann]);
});

it("leaves someone already at the table where they are", () => {
  const watching = addSpectator(emptyTable(), ann);
  expect(addSpectator(watching, ann)).toBe(watching);
  const sitting = tableWith([seated("ann")]);
  expect(addSpectator(sitting, ann)).toBe(sitting);
});
