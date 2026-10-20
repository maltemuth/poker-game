/**
 * Checks that the package's entry point exports the rules. The rules have
 * tests of their own, next to this file.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import * as pokerGame from "../src/index.js";

it("exports the rules, the button translation and the views", () => {
  assert.deepEqual(Object.keys(pokerGame).sort(), [
    "SPECTATORS",
    "addSpectator",
    "allCards",
    "allowedBets",
    "applyAction",
    "applyHandAction",
    "applyTableAction",
    "audienceOf",
    "availableUiActions",
    "awardPots",
    "betToMatch",
    "blindLevelOfHand",
    "blindPositions",
    "blindsAtLevel",
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
    "levelOfHand",
    "newPlayerRules",
    "newTable",
    "nextBettingRound",
    "nextToAct",
    "oddChipOrder",
    "optionProblems",
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
    "viewHand",
    "viewTable",
  ]);
});
