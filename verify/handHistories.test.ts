/**
 * Checks the betting rules against real hand histories: every downloaded hand
 * the rules cover is replayed, and any disagreement fails the check. Run it
 * with `npm run verify:hands`, after `npm run download:hands`; `npm test`
 * doesn't include it.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import { existsSync } from "node:fs";
import { handHistoryFolder, readHands } from "./phh/readHands.js";
import { type Disagreement, replayBetting } from "./phh/replayBetting.js";
import { toBettingHand } from "./phh/toBettingHand.js";

/** Counts per reason, most frequent first */
const tally = (reasons: string[]): string =>
  Object.entries(
    reasons.reduce<Record<string, number>>(
      (counts, reason) => ({ ...counts, [reason]: (counts[reason] ?? 0) + 1 }),
      {}
    )
  )
    .sort(([, a], [, b]) => b - a)
    .map(([reason, count]) => `  ${count} × ${reason}`)
    .join("\n");

const describeDisagreement = (disagreement: Disagreement): string =>
  `${disagreement.hand}, action ${disagreement.at ?? "end"}` +
  (disagreement.action ? ` (${disagreement.action})` : "") +
  `: ${disagreement.message}`;

it("agrees with every recorded hand it covers", () => {
  if (!existsSync(handHistoryFolder)) {
    throw new Error("No hand histories; run npm run download:hands first");
  }
  const hands = readHands();
  const skipped: string[] = [];
  const disagreements: Disagreement[] = [];
  let replayed = 0;

  for (const hand of hands) {
    const bettingHand = toBettingHand(hand);
    if (typeof bettingHand === "string") {
      skipped.push(bettingHand);
      continue;
    }
    replayed++;
    const disagreement = replayBetting(bettingHand);
    if (disagreement) disagreements.push(disagreement);
  }

  const report = [
    `${hands.length} hands: ${replayed} replayed, ${skipped.length} skipped, ${disagreements.length} disagreeing`,
    ...(skipped.length ? ["Skipped:", tally(skipped)] : []),
    ...(disagreements.length
      ? [
          "Disagreements:",
          tally(disagreements.map((d) => d.message.replace(/\d+/g, "<n>"))),
          "First ones:",
          ...disagreements
            .slice(0, 10)
            .map((d) => `  ${describeDisagreement(d)}`),
        ]
      : []),
  ].join("\n");
  console.log(report);
  assert.deepEqual(disagreements, []);
});
