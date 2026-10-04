/**
 * The plugin's entry point, `poker-game/plugin`: what a host imports to run
 * Hold'em tables in Remote State. It's separate from the rules' entry point
 * so that clients, which import the rules and views, don't load Remote
 * State's server.
 */

export type { HoldemAction, SystemAction } from "./HoldemAction.js";
export type {
  HoldemPlugin,
  HoldemPluginOptions,
} from "./createHoldemPlugin.js";
export { isSystemAction } from "./HoldemAction.js";
export { createHoldemPlugin } from "./createHoldemPlugin.js";
