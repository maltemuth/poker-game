import { PokerTableState } from "./PokerTableState";

export const createTable = (): PokerTableState => {
  return {
    players: [],
    spectators: [],
    currentPlayerId: null,
    board: [],
    deck: [],
    paused: false,
    stopped: true,
    currentRound: null,
  };
};
