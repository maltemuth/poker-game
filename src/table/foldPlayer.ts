/**
 * Folds a player's hand when they get up from the table, by a break or by
 * leaving (decisions 0009, 0010): if they're dealt into the hand being played
 * and can still act, their hand is folded at once, in turn or not. An all-in
 * player stays in: they can't act, so they hold up no one. If the fold ends
 * the hand, it's settled right away.
 */

import { canAct } from "../betting/seatStatus.js";
import type { Draw } from "../hand/Draw.js";
import { foldInHand } from "../hand/foldInHand.js";
import { handSeatOf } from "./lookups.js";
import { settleHand } from "./settleHand.js";
import type { Table } from "./Table.js";

export const foldPlayer = (
  table: Table,
  playerId: string,
  draw: Draw
): Table => {
  const index = handSeatOf(table, playerId);
  if (index === null || !table.hand) return table;
  if (!canAct(table.hand.betting.seats[index])) return table;
  const hand = foldInHand(table.hand, index, draw);
  const folded = { ...table, hand };
  return hand.result ? settleHand(folded) : folded;
};
