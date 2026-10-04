/**
 * Checks that the package's entry point exports the rules. The rules have
 * tests of their own, next to this file.
 */

import * as pokerGame from "../src/index.js";

it("exports the betting rules and the button translation", () => {
  expect(Object.keys(pokerGame).sort()).toEqual([
    "allowedBets",
    "applyAction",
    "availableUiActions",
    "betToMatch",
    "canAct",
    "checkAction",
    "isAllIn",
    "isInHand",
    "nextStreet",
    "nextToAct",
    "postBlinds",
    "translateUiAction",
  ]);
});
