/**
 * One pot to its winners: the seats with the best rank among those that can
 * win it, shared evenly on a tie. Ranks are numbers, higher is better, such
 * as poker-hands' `handRank`; betting doesn't know about cards. Chips left
 * over go one each to the winners in odd-chip order ([oddChips](oddChips.ts)).
 */

import type { Pot } from "./Pot.js";

/** Hand ranks by seat number; higher is better */
export type Ranks = Record<number, number>;

export interface Award {
  seat: number;
  amount: number;
}

/**
 * @param oddChipOrder - Every seat number, in the order winners get odd chips
 * @throws {Error} If a seat that can win a contested pot has no rank
 */
export const splitPot = (
  pot: Pot,
  ranks: Ranks,
  oddChipOrder: number[]
): Award[] => {
  if (pot.seats.length === 1) {
    return [{ seat: pot.seats[0], amount: pot.amount }];
  }
  const rankOf = (seat: number) => {
    const rank = ranks[seat];
    if (rank === undefined) throw new Error(`Seat ${seat} has no rank`);
    return rank;
  };
  const best = Math.max(...pot.seats.map(rankOf));
  const winners = oddChipOrder.filter(
    (seat) => pot.seats.includes(seat) && rankOf(seat) === best
  );
  const share = Math.floor(pot.amount / winners.length);
  const left = pot.amount - share * winners.length;
  return winners.map((seat, index) => ({
    seat,
    amount: share + (index < left ? 1 : 0),
  }));
};
