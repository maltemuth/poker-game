import { Player } from "./PokerTableState";

export enum ActionType {
  CHECK = "CHECK",
  CALL = "CALL",
  RAISE = "RAISE",
  FOLD = "FOLD",
  UNSEAT = "UNSEAT",
  RESEAT = "RESEAT",
  LEAVE = "LEAVE",
  RETURN = "RETURN",
  START = "START",
  PAUSE = "PAUSE",
  UNPAUSE = "UNPAUSE",
}

export interface Action {
  type: ActionType;
  player: Pick<Player, "id">;
}

export interface RaiseAction extends Action {
  type: ActionType.RAISE;
  betAmount: number;
}
