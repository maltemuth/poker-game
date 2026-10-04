/**
 * Drawing cards at random, for real hands: every card still out is equally
 * likely, from Node's cryptographically secure random numbers.
 */

import { randomInt } from "node:crypto";
import type { Draw } from "./Draw.js";

export const randomDraw: Draw = (out) => out[randomInt(out.length)];
