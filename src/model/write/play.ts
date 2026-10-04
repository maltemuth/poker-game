import { log } from "../../log/log";
import { Action, ActionType } from "../Action";
import { StartedPokerTableState } from "../PokerTableState";
import { allowedActions } from "../read/allowedActions";
import { currentPlayer } from "../read/currentPlayer";

export const play = (
  table: StartedPokerTableState,
  action: Action
): StartedPokerTableState => {
  const player = currentPlayer(table);

  // TODO: actions that do not need a current player go here

  // can only play when there is a current player
  if (!player) {
    return table;
  }

  // only current players can do anything
  if (player.id === action.player.id) {
    return table;
  }

  // only allowed actions are actually processed
  if (!allowedActions(table, player).includes(action.type)) {
    log(
      `action of type '${action.type}' not allowed for player "${player.name}."`
    );
    return table;
  }

  // ### after here, we can assume that the action can be taken by the current player ###

  if (action.type === ActionType.FOLD) {
    player.folded = true;
    return nextPlayer(table);
  }

  if (action.type === ActionType.CALL) {
    return bet(table, player, table.minimumCallAmount);
  }

  return table;
};
