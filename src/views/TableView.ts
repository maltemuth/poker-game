/**
 * What one audience sees of a table: everything public, plus, for a seated
 * player, their own hole cards and the buttons they may click. No one else's
 * hole cards appear until they're tabled or shown, except to spectators at a
 * table that allows it. Seats are identified by
 * seat number, from 1, as players see them.
 */

import type { Pot } from "../pots/Pot.js";
import type { Card } from "../hand/cards.js";
import type { BettingRoundName, HandResult } from "../hand/Hand.js";
import type { Person } from "../table/Table.js";
import type { TableOptions } from "../table/TableOptions.js";
import type { BlindLevel } from "../table/blindLevels.js";
import type { RankedHand } from "../hand/rankHand.js";
import type { UiOption } from "../ui/availableUiActions.js";

export interface SeatView {
  seat: number;
  playerId: string;
  name: string;
  /** Chips not in the middle: during a hand, what's left of the stack */
  stack: number;
  /** On a break */
  sittingOut: boolean;
  /** Waiting to be dealt in by the table's new-player rule */
  newPlayer: boolean;
  /** Leaving when the hand is over */
  leaving: boolean;
}

export interface HandPlayerView {
  seat: number;
  /** Chips bet in this betting round, in front of the player */
  bet: number;
  folded: boolean;
  allIn: boolean;
  /** The hole cards, if the audience may see them; otherwise null */
  cards: Card[] | null;
}

export interface HandView {
  bettingRound: BettingRoundName;
  board: Card[];
  /** The pots collected from earlier betting rounds */
  pots: Pot[];
  players: HandPlayerView[];
  /** The seat number of the button */
  button: number;
  /** The seat number of the player to act, or null */
  toAct: number | null;
  /** The bet to match in this betting round */
  currentBet: number;
  /** Changes with every new turn */
  turn: number;
  /** No more betting is possible, and the hands still in are face up */
  tabled: boolean;
  /** Null while the hand is played; then the shown hands and who won what */
  result: HandResult | null;
}

/** What only the viewer sees: present in a seated player's view */
export interface ViewerView {
  playerId: string;
  /** Their seat number */
  seat: number;
  /** The buttons they may click now; empty when it isn't their turn, or the table is interrupted */
  buttons: UiOption[];
  /**
   * Their best hand from their hole cards and the board so far, ranked as at
   * showdown; null when they weren't dealt into the hand being played or the
   * last. From two cards before the flop, such as a pair or a high card
   */
  bestHand: RankedHand | null;
}

export interface TableView {
  options: TableOptions;
  /** One entry per seat, by seat number minus one; null when empty */
  seats: (SeatView | null)[];
  spectators: Person[];
  /** The hand being played, or the last one; null before the first hand */
  hand: HandView | null;
  /** The viewer, if they're seated; null for spectators */
  you: ViewerView | null;
  /** No new hands are dealt while it's paused */
  paused: boolean;
  /** Nothing happens until the host resumes the table, after a server restart */
  interrupted: boolean;
  /**
   * When the turn being played runs out, in milliseconds since the epoch, by
   * the server's clock; null while no turn is timed (decision 0019)
   */
  turnDeadline: number | null;
  /** The number of the current or last hand; 0 before the first */
  handNumber: number;
  /**
   * The blind level of the hand being played, or of the next one to be dealt
   * when none is, with the next level (decision 0022)
   */
  blindLevel: BlindLevel;
}
