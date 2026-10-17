/**
 * Tests for someone arriving at the table as a spectator.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { addSpectator } from "../../src/table/addSpectator.js";
import { emptyTable, seated, tableWith } from "../helpers/table.js";

const ann = { playerId: "ann", name: "Ann" };

it("adds someone new as a spectator", () => {
  assert.deepEqual(addSpectator(emptyTable(), ann).spectators, [ann]);
});

it("leaves someone already at the table where they are", () => {
  const watching = addSpectator(emptyTable(), ann);
  assert.equal(addSpectator(watching, ann), watching);
  const sitting = tableWith([seated("ann")]);
  assert.equal(addSpectator(sitting, ann), sitting);
});
