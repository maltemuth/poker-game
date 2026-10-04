import { Player, PokerTableState } from "../PokerTableState";

export const currentPlayer = (table: PokerTableState): Player | undefined => {
  return table.players.find((player) => player.id === table.currentPlayerId);
};
