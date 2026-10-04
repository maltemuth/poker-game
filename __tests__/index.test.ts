/**
 * Checks that the package's entry point exports the rules. The rules have
 * tests of their own, next to this file.
 */

import * as pokerGame from "../src/index.js";

it("exports the betting rules, the pots and the button translation", () => {
  expect(Object.keys(pokerGame).sort()).toEqual([
    "allowedBets",
    "applyAction",
    "availableUiActions",
    "awardPots",
    "betToMatch",
    "canAct",
    "checkAction",
    "clockwiseFromButton",
    "collectBets",
    "isAllIn",
    "isInHand",
    "nextBettingRound",
    "nextToAct",
    "oddChipOrder",
    "postBlinds",
    "pots",
    "returnUncalledBet",
    "splitPot",
    "translateUiAction",
  ]);
});
