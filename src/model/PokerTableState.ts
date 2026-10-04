import { Card } from "@malte.muth/poker-hands/dist/src/model/card/Card";

export enum BettingRoundType {
  PreFlop = "PreFlop",
  Flop = "Flop",
  Turn = "Turn",
  River = "River",
}

export type PlayerId = string;

export interface Spectator {
  name: string;
  id: PlayerId;
  // the total amount of chips the player has available for betting
  chips: number;
  connected: boolean;
}

export interface Player extends Spectator {
  // the total amount already bet in the current round
  currentBet: number;
  // the cards that the player is holding
  cards: Card[];
  // the seat number (human-readable)
  seat: number;
  // true if the player has folded already this round
  folded: boolean;
}

export interface Pot {
  // the total number of chips in this pot
  amount: number;
  // the players that are still "in" this pot
  playerIds: PlayerId[];
}

interface BettingRoundState {
  bettingRound: BettingRoundType;
  pots: Pot[];
  currentPlayer: PlayerId;
  amountNeededForCalling: number;
  lastPlayerToRaise: PlayerId;
  dealer: PlayerId;
}

export interface PokerTableState {
  // the players at the table
  players: Player[];
  // the spectators at the table
  spectators: Spectator[];
  // the id of the player that is next to make a play
  currentPlayerId: PlayerId | null;
  //   leavingPlayers: PlayerId[];
  currentRound: BettingRoundState | null;
  // cards currently revealed on the board
  board: Card[];
  // unrevealed cards in the deck on the board
  deck: Card[];

  stopped: boolean;
  paused: boolean;
}

export interface StartedPokerTableState extends PokerTableState {
  currentRound: BettingRoundState;
  stopped: false;
}
