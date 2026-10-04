/**
 * Checks that the package's entry point exports the rules. The rules have
 * tests of their own, next to this file.
 */

import * as pokerGame from "../src/index.js";

it("exports the betting rules, the pots, the hand, the table and the button translation", () => {
  expect(Object.keys(pokerGame).sort()).toEqual([
    "addSpectator",
    "allCards",
    "allowedBets",
    "applyAction",
    "applyHandAction",
    "applyTableAction",
    "availableUiActions",
    "awardPots",
    "betToMatch",
    "blindPositions",
    "canAct",
    "cardsOut",
    "checkAction",
    "checkHandAction",
    "checkStartHand",
    "checkTableAction",
    "clockwiseFromButton",
    "collectBets",
    "continueHand",
    "drawCards",
    "endHand",
    "fixedDraw",
    "handIsRunning",
    "handSeatOf",
    "isAllIn",
    "isCard",
    "isInHand",
    "isSpectator",
    "newPlayerRules",
    "newTable",
    "nextBettingRound",
    "nextToAct",
    "oddChipOrder",
    "playersToDeal",
    "playingSeats",
    "postBlinds",
    "pots",
    "randomDraw",
    "rankHand",
    "returnUncalledBet",
    "seatOf",
    "settleHand",
    "splitPot",
    "startHand",
    "startNextHand",
    "translateUiAction",
  ]);
});
