/**
 * Checks that the package's entry point loads. The rules have tests of their
 * own, next to this file.
 */

import * as pokerGame from "../src/index.js";

it("loads the entry point", () => {
  expect(pokerGame).toBeDefined();
});
