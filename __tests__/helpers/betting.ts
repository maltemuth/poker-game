/**
 * Builds betting rounds for tests, filling in what a test doesn't care
 * about, and adds up a round's chips to check that they're conserved.
 */

import type {
  BettingRound,
  BettingSeat,
} from "../../src/betting/BettingRound.js";

/** A seat with 1,000 chips and nothing bet, numbered by its index */
export const seat = (
  index: number,
  fields: Partial<BettingSeat> = {}
): BettingSeat => ({
  seat: index + 1,
  stack: 1000,
  bet: 0,
  committed: fields.bet ?? 0,
  folded: false,
  actedAt: null,
  ...fields,
});

/** A round of `seats`, with the button on the first, blinds of 50/100 and no bet yet */
export const round = (
  seats: Partial<BettingSeat>[],
  fields: Partial<BettingRound> = {}
): BettingRound => ({
  seats: seats.map((fields, index) => seat(index, fields)),
  button: 0,
  toAct: 1 % seats.length,
  currentBet: 0,
  minRaise: 100,
  bigBlind: 100,
  ...fields,
});

/** Every chip in the round: what's left in the stacks plus what was put in */
export const chips = (round: BettingRound): number =>
  round.seats.reduce((sum, seat) => sum + seat.stack + seat.committed, 0);
