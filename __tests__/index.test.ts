/**
 * Checks that the package's entry point exports the rules. The rules have
 * tests of their own, next to this file.
 */

import * as pokerGame from "../src/index.js";

it("exports the betting rules, the pots, the hand and the button translation", () => {
  expect(Object.keys(pokerGame).sort()).toEqual([
    "allCards",
    "allowedBets",
    "applyAction",
    "applyHandAction",
    "availableUiActions",
    "awardPots",
    "betToMatch",
    "canAct",
    "cardsOut",
    "checkAction",
    "checkHandAction",
    "clockwiseFromButton",
    "collectBets",
    "continueHand",
    "drawCards",
    "endHand",
    "fixedDraw",
    "isAllIn",
    "isCard",
    "isInHand",
    "nextBettingRound",
    "nextToAct",
    "oddChipOrder",
    "postBlinds",
    "pots",
    "randomDraw",
    "rankHand",
    "returnUncalledBet",
    "splitPot",
    "startHand",
    "translateUiAction",
  ]);
});
