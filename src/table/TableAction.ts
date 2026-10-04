/**
 * Everything a player can do at a table: seating actions, and the betting
 * buttons. Starting a hand isn't a player's action; the host does it.
 */

import type { UiAction } from "../ui/UiAction.js";
import type { Leave } from "./leave.js";
import type { SitDown } from "./sitDown.js";
import type { SitIn } from "./sitIn.js";
import type { StandUp } from "./standUp.js";

export type TableAction = SitDown | StandUp | SitIn | Leave | UiAction;
