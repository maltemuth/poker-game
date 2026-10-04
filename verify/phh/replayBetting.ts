/**
 * Replays a hand's recorded betting through the rules and reports the first
 * point where they disagree with what happened at the real table.
 *
 * Each player action must come from the player the rules expect to act, and
 * must translate into an action the rules accept: `f` is a fold, `cc` a check
 * or call, and `cbr` a raise to its amount. Each board card must be dealt only
 * when the betting round is over. At the end, no one may still be to act.
 * Dealing hole cards and showing hands don't concern betting and are skipped.
 */

import { applyAction } from "../../src/betting/applyAction.js";
import { allowedBets } from "../../src/betting/allowedBets.js";
import type { BettingRound } from "../../src/betting/BettingRound.js";
import { checkAction } from "../../src/betting/checkAction.js";
import { nextStreet } from "../../src/betting/nextStreet.js";
import { postBlinds } from "../../src/betting/postBlinds.js";
import { isInHand } from "../../src/betting/seatStatus.js";
import { translateUiAction } from "../../src/ui/translateUiAction.js";
import type { UiAction } from "../../src/ui/UiAction.js";
import type { BettingHand } from "./toBettingHand.js";

export interface Disagreement {
  hand: string;
  /** Index into the hand's actions, or null for the end of the hand */
  at: number | null;
  action: string | null;
  message: string;
}

const player = (index: number | null) =>
  index === null ? "no one" : `p${index + 1}`;

/** The button a recorded player action stands for */
const uiAction = (
  round: BettingRound,
  code: string,
  amount: string | undefined
): UiAction | string => {
  if (code === "f") return { type: "fold" };
  if (code === "cbr") {
    return { type: "raise", to: Math.round(Number(amount) * 100) };
  }
  if (code === "cc") {
    const allowed = allowedBets(round);
    const seat = allowed && round.seats[allowed.index];
    return seat && allowed.call > seat.bet
      ? { type: "call" }
      : { type: "check" };
  }
  return `unknown action code ${code}`;
};

/** The first disagreement between the rules and the recorded hand, or null */
export const replayBetting = (hand: BettingHand): Disagreement | null => {
  let round = postBlinds(hand.players, hand.button, hand.blinds);

  for (const [at, recorded] of hand.actions.entries()) {
    const disagree = (message: string): Disagreement => ({
      hand: hand.name,
      at,
      action: recorded,
      message,
    });
    const [actor, code, argument] = recorded.split("#")[0].trim().split(/\s+/);
    if (!actor) continue;

    if (actor === "d") {
      if (code !== "db") continue;
      if (round.toAct !== null) {
        return disagree(`board dealt while ${player(round.toAct)} is to act`);
      }
      if (round.seats.filter(isInHand).length < 2) {
        return disagree("board dealt after the hand was won");
      }
      round = nextStreet(round);
      continue;
    }

    if (code === "sm") continue;
    const index = Number(actor.slice(1)) - 1;
    if (round.toAct !== index) {
      return disagree(`${actor} acted, but ${player(round.toAct)} is to act`);
    }
    const button = uiAction(round, code, argument);
    if (typeof button === "string") return disagree(button);
    const action = translateUiAction(round, button);
    if (typeof action === "string") return disagree(action);
    const accepted = checkAction(round, action);
    if (accepted !== true) return disagree(accepted);
    round = applyAction(round, action);
  }

  if (round.toAct !== null) {
    return {
      hand: hand.name,
      at: null,
      action: null,
      message: `the hand ends while ${player(round.toAct)} is to act`,
    };
  }
  return null;
};
