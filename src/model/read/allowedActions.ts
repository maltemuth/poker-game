import { ActionType } from "../Action";
import { Player, PokerTableState } from "../PokerTableState";
import { currentPlayer } from "./currentPlayer";

export const allowedActions = (
  table: PokerTableState,
  player: Player
): ActionType[] => {
  const current = currentPlayer(table);
  if (!current) {
    // TODO: seat / unseat and stuff goes here I guess
    return [];
  }

  if (current.id !== player.id) {
    // TODO: seat / unseat and stuff goes here I guess
    return [];
  }

  const alwaysAllowed = [ActionType.CALL, ActionType.FOLD];

  return alwaysAllowed;

  // TODO: when can a player CHECK?
  // TODO: when can a player RAISE?
};
