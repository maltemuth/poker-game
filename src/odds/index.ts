/**
 * The odds' entry point, `poker-game/odds`: for clients that show each hand's
 * chances. It's separate from the rules' entry point, so only clients that
 * show odds load poker-hands' WebAssembly package.
 */

export type { PlayerOdds } from "./viewOdds.js";
export { viewOdds } from "./viewOdds.js";
