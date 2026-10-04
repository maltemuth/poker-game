/**
 * The betting round after the player to act folds or bets. A bet above the
 * current bet is a raise: it becomes the bet to match, and if it adds at
 * least a full raise, it sets the size of the next minimum raise. Then the
 * turn passes to the next player who must act.
 */

import type { BettingAction } from "./BettingAction.js";
import type { BettingRound, BettingSeat } from "./BettingRound.js";
import { checkAction } from "./checkAction.js";
import { nextToAct } from "./nextToAct.js";

const raised = (round: BettingRound, to: number) => {
  if (to <= round.currentBet) return round;
  const raisedBy = to - round.currentBet;
  return {
    ...round,
    currentBet: to,
    minRaise: raisedBy >= round.minRaise ? raisedBy : round.minRaise,
  };
};

/**
 * Applies an action that [checkAction](checkAction.ts) accepts.
 *
 * @throws {Error} If `checkAction` rejects it; check actions first.
 */
export const applyAction = (
  round: BettingRound,
  action: BettingAction
): BettingRound => {
  const accepted = checkAction(round, action);
  if (accepted !== true) throw new Error(`Invalid action: ${accepted}`);
  const index = round.toAct as number;
  const seat = round.seats[index];

  let next: BettingRound;
  let acted: BettingSeat;
  if (action.type === "fold") {
    next = round;
    acted = { ...seat, folded: true, actedAt: round.currentBet };
  } else {
    const added = action.to - seat.bet;
    next = raised(round, action.to);
    acted = {
      ...seat,
      stack: seat.stack - added,
      bet: action.to,
      committed: seat.committed + added,
      actedAt: next.currentBet,
    };
  }

  const seats = round.seats.map((other, i) => (i === index ? acted : other));
  const after = { ...next, seats };
  return { ...after, toAct: nextToAct(after, index) };
};
