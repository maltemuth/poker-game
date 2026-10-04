/**
 * Many hands at one table, with people sitting down, taking breaks and
 * leaving between and during hands, under each rule for new players. Checks that
 * every chip bought in is on the table or left with a player, that the
 * button is always on a player dealt in, that no one sits without chips
 * between hands, and that new players join as their rule says.
 */

import { blindPositions } from "../../src/betting/postBlinds.js";
import type { Draw } from "../../src/hand/Draw.js";
import { addSpectator } from "../../src/table/addSpectator.js";
import { applyTableAction } from "../../src/table/applyTableAction.js";
import { checkTableAction } from "../../src/table/checkTableAction.js";
import { handIsRunning } from "../../src/table/lookups.js";
import { newTable } from "../../src/table/newTable.js";
import {
  checkStartHand,
  startNextHand,
} from "../../src/table/startNextHand.js";
import type { Table } from "../../src/table/Table.js";
import type { TableAction } from "../../src/table/TableAction.js";
import { newPlayerRules } from "../../src/table/TableOptions.js";
import { availableUiActions } from "../../src/ui/availableUiActions.js";
import { random } from "../helpers/random.js";
import { options } from "../helpers/table.js";

const people = ["a", "b", "c", "d", "e", "f", "g", "h"];

describe.each(newPlayerRules)("random sessions, new players: %s", (rule) => {
  it("keeps every chip, the button and the new players right", () => {
    for (let session = 0; session < 40; session++) {
      const next = random(session);
      const pick = <T>(items: T[]): T =>
        items[Math.floor(next() * items.length)];
      const draw: Draw = (out) => pick(out);

      let table: Table = newTable({ ...options, newPlayers: rule });
      for (const id of people)
        table = addSpectator(table, { playerId: id, name: id });
      let boughtIn = 0;
      let leftWith = 0;

      /** Tries an action, keeping the table if the rules refuse it */
      const tryAction = (playerId: string, action: TableAction) => {
        if (checkTableAction(table, playerId, action) !== true) return;
        const before = table;
        table = applyTableAction(table, playerId, action, draw);
        if (action.type === "sitDown") boughtIn += action.buyIn;
        // whoever lost their seat left with their chips
        before.seats.forEach((seat, index) => {
          if (seat && !table.seats[index]) {
            const fromHand = table.hand?.betting.seats.find(
              (s) => s.seat === index + 1
            );
            leftWith +=
              before.hand?.result === null && fromHand
                ? fromHand.stack
                : seat.stack;
          }
        });
      };

      /** Someone does something about their seat */
      const seatingEvent = () => {
        const id = pick(people);
        const action: TableAction = pick<TableAction>([
          {
            type: "sitDown",
            seat: 1 + Math.floor(next() * 6),
            buyIn: 1000 + Math.floor(next() * 4001),
          },
          { type: "sitDown", seat: 1 + Math.floor(next() * 6), buyIn: 1000 },
          { type: "standUp" },
          { type: "sitIn" },
          { type: "leave" },
        ]);
        tryAction(id, action);
      };

      for (let round = 0; round < 30; round++) {
        for (let events = 0; events < 3; events++) seatingEvent();
        if (checkStartHand(table) !== true) continue;

        const waiting = table.seats.map((seat) => seat?.newPlayer ?? false);
        const previousButton = table.button;
        table = startNextHand(table, draw);
        const hand = table.hand!;
        const dealt = hand.betting.seats.map((seat) => seat.seat - 1);

        // the button is on a player dealt in, and moved if it could
        expect(dealt).toContain(table.button);
        if (previousButton !== null && dealt.length > 1) {
          expect(table.button).not.toBe(previousButton);
        }
        // new players join as their rule says
        const { bigBlind } = blindPositions(
          dealt.length,
          dealt.indexOf(table.button!)
        );
        // (at a table that's starting, they're simply dealt in)
        const running = dealt.filter((seat) => !waiting[seat]).length >= 2;
        dealt.forEach((seat, index) => {
          if (!waiting[seat] || !running) return;
          if (rule === "waitForBigBlind") expect(index).toBe(bigBlind);
          // unless the blinds already played the hand out
          if (rule === "postBigBlind" && hand.result === null) {
            expect(hand.betting.seats[index].committed).toBe(
              Math.min(options.blinds.big, table.seats[seat]!.stack)
            );
          }
        });

        // play the hand with random buttons, and sometimes a seating event
        for (let step = 0; handIsRunning(table); step++) {
          expect(step).toBeLessThan(500);
          if (next() < 0.1) seatingEvent();
          if (!handIsRunning(table)) break;
          const betting = table.hand!.betting;
          const toAct = betting.seats[betting.toAct!];
          const player = table.seats[toAct.seat - 1]!;
          const option = pick(availableUiActions(betting));
          tryAction(
            player.playerId,
            option.type === "raise"
              ? {
                  type: "raise",
                  to:
                    option.min +
                    Math.floor(next() * (option.max - option.min + 1)),
                }
              : { type: option.type }
          );
        }

        // between hands: every chip accounted for, and no one sits without chips
        const onTable = table.seats.reduce(
          (sum, seat) => sum + (seat?.stack ?? 0),
          0
        );
        expect(onTable + leftWith).toBe(boughtIn);
        expect(table.seats.every((seat) => !seat || seat.stack > 0)).toBe(true);
        const seatedIds = table.seats.flatMap((seat) =>
          seat ? [seat.playerId] : []
        );
        expect(
          table.spectators.filter((person) =>
            seatedIds.includes(person.playerId)
          )
        ).toEqual([]);
      }
    }
  });
});
