/**
 * Tests for the end of a hand: the last bets collected, every pot paid out,
 * including a tie in a side pot but not the main pot, and a hand won because
 * everyone else folded.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { awardPots } from "../../src/pots/awardPots.js";
import { chips, round } from "../helpers/betting.js";

// river, betting over: seat 1 is all-in for 200 in total, seat 2 for 500,
// seats 3 and 4 put in 800, seat 5 folded after 100
const showdown = round(
  [
    { bet: 0, committed: 200, stack: 0 },
    { bet: 0, committed: 500, stack: 0 },
    { bet: 300, committed: 800, stack: 200, actedAt: 300 },
    { bet: 300, committed: 800, stack: 200, actedAt: 300 },
    { bet: 0, committed: 100, stack: 900, folded: true },
  ],
  { toAct: null, button: 4 }
);

it("pays every pot to its best rank", () => {
  const { round: after, awards } = awardPots(showdown, {
    1: 9,
    2: 7,
    3: 5,
    4: 3,
  });
  assert.deepEqual(awards, [
    [{ seat: 1, amount: 900 }], // 200 from four seats, 100 from seat 5
    [{ seat: 2, amount: 900 }], // 300 from seats 2, 3, 4
    [{ seat: 3, amount: 600 }], // 300 from seats 3, 4
  ]);
  assert.deepEqual(
    after.seats.map((seat) => seat.stack),
    [900, 900, 800, 200, 900]
  );
});

it("splits a side pot on a tie while the main pot has one winner", () => {
  const { awards } = awardPots(showdown, { 1: 9, 2: 5, 3: 7, 4: 7 });
  assert.deepEqual(awards, [
    [{ seat: 1, amount: 900 }],
    [
      { seat: 3, amount: 450 },
      { seat: 4, amount: 450 },
    ],
    [
      { seat: 3, amount: 300 },
      { seat: 4, amount: 300 },
    ],
  ]);
});

it("leaves nothing in the middle, and conserves chips", () => {
  const { round: after } = awardPots(showdown, { 1: 1, 2: 2, 3: 3, 4: 4 });
  assert.deepEqual(after.pots, []);
  assert.equal(
    after.seats.every((seat) => seat.committed === 0),
    true
  );
  assert.equal(
    after.seats.every((seat) => seat.bet === 0),
    true
  );
  assert.equal(chips(after), chips(showdown));
});

it("gives everything to the last player when the others fold, without ranks", () => {
  // seat 3 bet 300; the blinds folded
  const foldedToRaise = round(
    [
      { bet: 50, folded: true },
      { bet: 100, folded: true },
      { bet: 300, stack: 700, actedAt: 300 },
    ],
    { toAct: null }
  );
  const { round: after, awards } = awardPots(foldedToRaise, {});
  assert.deepEqual(awards, [[{ seat: 3, amount: 250 }]]);
  // 200 of the raise came back uncalled
  assert.equal(after.seats[2].stack, 1150);
});

it("refuses while the betting is still on", () => {
  assert.throws(() => awardPots({ ...showdown, toAct: 2 }, {}), {
    message: "The betting round isn't over",
  });
});
