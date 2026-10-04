/**
 * Reads the hand histories that `npm run download:hands` put into
 * hand-histories/. Each `.phhs` file is TOML with one table per hand, in the
 * Poker Hand History format (https://github.com/uoftcprg/phh-std). Only the
 * fields the betting check needs are typed.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "smol-toml";

export interface PhhHand {
  /** Where the hand is from: the file and its key in it */
  name: string;
  variant: string;
  antes: number[];
  blinds_or_straddles: number[];
  min_bet: number;
  starting_stacks: number[];
  actions: string[];
}

/** hand-histories/ in the package root, where npm runs scripts */
export const handHistoryFolder = join(process.cwd(), "hand-histories");

/** Every hand in the folder's `.phhs` files, in file order */
export const readHands = (folder = handHistoryFolder): PhhHand[] =>
  readdirSync(folder)
    .filter((file) => file.endsWith(".phhs"))
    .sort()
    .flatMap((file) => {
      const tables = parse(readFileSync(join(folder, file), "utf8"));
      return Object.entries(tables).map(
        ([key, hand]) =>
          ({ ...(hand as object), name: `${file} [${key}]` }) as PhhHand
      );
    });
