/**
 * Tests for accepting or rejecting the player to act's action, with the
 * reasons the player is given.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { checkAction } from "../../src/betting/checkAction.js";
import type { BettingAction } from "../../src/betting/BettingAction.js";
import { round } from "../helpers/betting.js";

// seat 0 raised to 300, a full raise of 200; seat 1 has the big blind in
const raised = round(
  [{ bet: 300, stack: 700, actedAt: 300 }, { bet: 100, stack: 900 }, {}],
  { toAct: 1, currentBet: 300, minRaise: 200 }
);
const bet = (to: number): BettingAction => ({ type: "bet", to });

it("accepts a fold, a call, and raises within the range", () => {
  for (const action of [{ type: "fold" } as const, bet(300), bet(500)]) {
    assert.equal(checkAction(raised, action), true);
  }
  assert.equal(checkAction(raised, bet(1000)), true);
});

it("accepts a check when nothing is owed", () => {
  assert.equal(checkAction(round([{}, {}]), bet(0)), true);
});

it("rejects bets below the call", () => {
  assert.equal(
    checkAction(raised, bet(100)),
    "You must bet at least 300 to stay in"
  );
});

it("rejects raises below the minimum and above the stack", () => {
  assert.equal(
    checkAction(raised, bet(400)),
    "A raise must be to at least 500"
  );
  assert.equal(checkAction(raised, bet(1001)), "You only have 1000");
});

it("rejects a raise when raising isn't allowed, with the reason", () => {
  const againstAllIn = round([{ bet: 500, stack: 0 }, { bet: 100 }], {
    currentBet: 500,
  });
  assert.equal(checkAction(againstAllIn, bet(800)), "Everyone else is all-in");
});

it("rejects amounts that aren't whole chips", () => {
  assert.equal(
    checkAction(raised, bet(350.5)),
    "A bet must be a whole number of chips"
  );
  assert.equal(
    checkAction(raised, { type: "bet" } as unknown as BettingAction),
    "A bet must be a whole number of chips"
  );
});

it("rejects unknown actions", () => {
  assert.equal(
    checkAction(raised, { type: "check" } as unknown as BettingAction),
    "Unknown action"
  );
  assert.equal(
    checkAction(raised, null as unknown as BettingAction),
    "Unknown action"
  );
});

it("rejects everything once the round is over", () => {
  assert.equal(
    checkAction(round([{}, {}], { toAct: null }), bet(0)),
    "The betting round is over"
  );
});
