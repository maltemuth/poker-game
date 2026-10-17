/**
 * Tests for the buttons offered to the player to act, and that every button
 * offered translates into an action the rules accept.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { checkAction } from "../../src/betting/checkAction.js";
import type { BettingRound } from "../../src/betting/BettingRound.js";
import { availableUiActions } from "../../src/ui/availableUiActions.js";
import { translateUiAction } from "../../src/ui/translateUiAction.js";
import type { UiAction } from "../../src/ui/UiAction.js";
import { round } from "../helpers/betting.js";

const unopened = round([{}, {}]);
const facingRaise = round(
  [{ bet: 300, stack: 700, actedAt: 300 }, { bet: 100, stack: 900 }, {}],
  { toAct: 1, currentBet: 300, minRaise: 200 }
);
const shortStack = round(
  [{ bet: 2000, stack: 0, actedAt: 2000 }, { stack: 600 }, {}],
  { currentBet: 2000 }
);

it("offers fold, check and a first bet when nothing is bet", () => {
  assert.deepEqual(availableUiActions(unopened), [
    { type: "fold" },
    { type: "check" },
    { type: "raise", min: 100, max: 1000, firstBet: true },
    { type: "allIn", to: 1000 },
  ]);
});

it("offers fold, call with what it adds, and a raise when facing a bet", () => {
  assert.deepEqual(availableUiActions(facingRaise), [
    { type: "fold" },
    { type: "call", amount: 200, allIn: false },
    { type: "raise", min: 500, max: 1000, firstBet: false },
    { type: "allIn", to: 1000 },
  ]);
});

it("offers only fold and an all-in call to a player who can't cover the bet", () => {
  assert.deepEqual(availableUiActions(shortStack), [
    { type: "fold" },
    { type: "call", amount: 600, allIn: true },
  ]);
});

it("offers nothing once the round is over", () => {
  assert.deepEqual(availableUiActions(round([{}, {}], { toAct: null })), []);
});

it("offers only buttons that translate into accepted actions", () => {
  const accepted = (r: BettingRound, uiAction: UiAction) => {
    const action = translateUiAction(r, uiAction);
    return typeof action !== "string" && checkAction(r, action) === true;
  };
  for (const r of [unopened, facingRaise, shortStack]) {
    for (const option of availableUiActions(r)) {
      if (option.type === "raise") {
        assert.equal(accepted(r, { type: "raise", to: option.min }), true);
        assert.equal(accepted(r, { type: "raise", to: option.max }), true);
      } else {
        assert.equal(accepted(r, { type: option.type }), true);
      }
    }
  }
});
