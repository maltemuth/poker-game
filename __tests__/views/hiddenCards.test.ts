/**
 * No view ever contains a card its audience mustn't see: random hands are
 * played, and after every action, each seated player's view and the
 * spectators' view are searched for cards. Allowed are the board, the
 * viewer's own hole cards, tabled hands, and hands shown at showdown; and
 * every hole card for spectators at a table that allows it.
 */

import assert from "node:assert/strict";
import { it } from "node:test";
import type { Draw } from "../../src/hand/Draw.js";
import { addSpectator } from "../../src/table/addSpectator.js";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import { handIsRunning } from "../../src/table/lookups.js";
import { newTable } from "../../src/table/newTable.js";
import { startNextHand } from "../../src/table/startNextHand.js";
import type { Table } from "../../src/table/Table.js";
import { availableUiActions } from "../../src/ui/availableUiActions.js";
import { SPECTATORS } from "../../src/views/audiences.js";
import { viewTable } from "../../src/views/viewTable.js";
import { random } from "../helpers/random.js";
import { options } from "../helpers/table.js";

const cardsIn = (value: unknown): string[] =>
  JSON.stringify(value)
    .match(/"[2-9TJQKA][hdcs]"/g)
    ?.map((card) => card.slice(1, 3)) ?? [];

const allowedFor = (table: Table, audience: string): Set<string> => {
  const hand = table.hand!;
  const seated = table.seats.some((seat) => seat?.playerId === audience);
  if (!seated && table.options.spectatorsSeeHoleCards) {
    return new Set([...hand.board, ...hand.holeCards.flat()]);
  }
  const own = hand.betting.seats.flatMap((seat, index) =>
    table.seats[seat.seat - 1]?.playerId === audience
      ? hand.holeCards[index]
      : []
  );
  const tabled = hand.tabled
    ? hand.betting.seats.flatMap((seat, index) =>
        seat.folded ? [] : hand.holeCards[index]
      )
    : [];
  const shown = (hand.result?.shown ?? []).flatMap((s) => [
    ...s.cards,
    ...s.best,
  ]);
  return new Set([...hand.board, ...own, ...tabled, ...shown]);
};

for (const spectatorsSeeHoleCards of [false, true])
  it(`shows no audience a card it mustn't see, spectators seeing hole cards: ${spectatorsSeeHoleCards}`, () => {
    for (let game = 0; game < 200; game++) {
      const next = random(game);
      const pick = <T>(items: T[]): T =>
        items[Math.floor(next() * items.length)];
      const draw: Draw = (out) => pick(out);
      const count = 2 + Math.floor(next() * 5);

      let table = newTable({ ...options, spectatorsSeeHoleCards });
      for (let i = 0; i < count; i++) {
        const id = `p${i}`;
        table = addSpectator(table, { playerId: id, name: id });
        table = applyTableAction(
          table,
          id,
          {
            type: "sitDown",
            seat: i + 1,
            buyIn: 1000 + Math.floor(next() * 4001),
          },
          draw
        );
      }
      table = startNextHand(table, draw);

      const check = () => {
        const audiences = [
          SPECTATORS,
          ...table.seats.flatMap((s) => (s ? [s.playerId] : [])),
        ];
        for (const audience of audiences) {
          const allowed = allowedFor(table, audience);
          for (const card of cardsIn(viewTable(table, audience))) {
            assert.deepEqual(
              [audience, card, allowed.has(card)],
              [audience, card, true]
            );
          }
        }
      };

      check();
      while (handIsRunning(table)) {
        const betting = table.hand!.betting;
        const player = table.seats[betting.seats[betting.toAct!].seat - 1]!;
        const option = pick(availableUiActions(betting));
        table = applyTableAction(
          table,
          player.playerId,
          option.type === "raise"
            ? {
                type: "raise",
                to:
                  option.min +
                  Math.floor(next() * (option.max - option.min + 1)),
              }
            : { type: option.type },
          draw
        );
        check();
      }
    }
  });
