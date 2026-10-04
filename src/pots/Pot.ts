/**
 * A pot: chips in the middle and the seats that can win them. The main pot
 * comes first, then the side pots ([pots](pots.ts)).
 */

export interface Pot {
  amount: number;
  /** The seat numbers that can win the pot, in the order of the round's seats */
  seats: number[];
}
