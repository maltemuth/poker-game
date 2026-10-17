/**
 * Tests for translating buttons into the rules' actions, and the reasons
 * when a button doesn't apply.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { translateUiAction } from "../../src/ui/translateUiAction.js";
import type { UiAction } from "../../src/ui/UiAction.js";
import { round } from "../helpers/betting.js";

// seat 1 faces a raise to 300 with the big blind of 100 in
const facingRaise = round(
  [{ bet: 300, stack: 700, actedAt: 300 }, { bet: 100, stack: 900 }, {}],
  { toAct: 1, currentBet: 300, minRaise: 200 }
);
// nothing bet in this betting round
const unopened = round([{}, {}]);

it("translates a fold", () => {
  assert.deepEqual(translateUiAction(facingRaise, { type: "fold" }), {
    type: "fold",
  });
});

it("translates a check into a bet to what the player has in", () => {
  assert.deepEqual(translateUiAction(unopened, { type: "check" }), {
    type: "bet",
    to: 0,
  });
  assert.equal(
    translateUiAction(facingRaise, { type: "check" }),
    "You can't check: there's 200 to call"
  );
});

it("translates a call into a bet to the call", () => {
  assert.deepEqual(translateUiAction(facingRaise, { type: "call" }), {
    type: "bet",
    to: 300,
  });
  assert.equal(
    translateUiAction(unopened, { type: "call" }),
    "There's nothing to call; you can check"
  );
});

it("translates a raise into a bet to its total, leaving the amount to the rules", () => {
  assert.deepEqual(translateUiAction(facingRaise, { type: "raise", to: 600 }), {
    type: "bet",
    to: 600,
  });
  assert.deepEqual(translateUiAction(facingRaise, { type: "raise", to: 400 }), {
    type: "bet",
    to: 400,
  });
  assert.equal(
    translateUiAction(facingRaise, { type: "raise", to: 300 }),
    "A raise must be to more than 300"
  );
});

it("translates an all-in into a raise to everything", () => {
  assert.deepEqual(translateUiAction(facingRaise, { type: "allIn" }), {
    type: "bet",
    to: 1000,
  });
});

it("translates an all-in into a call when the call takes everything", () => {
  const short = round(
    [{ bet: 2000, stack: 0, actedAt: 2000 }, { stack: 600 }, {}],
    { currentBet: 2000 }
  );
  assert.deepEqual(translateUiAction(short, { type: "allIn" }), {
    type: "bet",
    to: 600,
  });
});

it("refuses an all-in when raising isn't allowed, with the reason", () => {
  const againstAllIn = round([{ bet: 500, stack: 0 }, { bet: 100 }], {
    currentBet: 500,
  });
  assert.equal(
    translateUiAction(againstAllIn, { type: "allIn" }),
    "Everyone else is all-in"
  );
});

it("refuses unknown buttons, and everything once the round is over", () => {
  assert.equal(
    translateUiAction(unopened, { type: "pot" } as unknown as UiAction),
    "Unknown action"
  );
  assert.equal(
    translateUiAction(round([{}, {}], { toAct: null }), { type: "fold" }),
    "The betting round is over"
  );
});
