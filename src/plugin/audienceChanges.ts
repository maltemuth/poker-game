/**
 * The audience changes an action brings (Texas Hold'em design, Audiences):
 * someone who took a seat moves to their own audience, and someone who lost
 * their seat, by leaving or running out of chips, moves to `spectators`.
 * Found by comparing who is seated before and after, so it covers every
 * action, including those that settle a hand.
 */

import type { AudienceChanges } from "@malte.muth/remote-state";
import type { Table } from "../table/Table.js";
import { SPECTATORS } from "../views/audiences.js";

const seatedIds = (table: Table): Set<string> =>
  new Set(table.seats.flatMap((seat) => (seat ? [seat.playerId] : [])));

export const audienceChanges = (
  before: Table,
  after: Table
): AudienceChanges => {
  const was = seatedIds(before);
  const is = seatedIds(after);
  return Object.fromEntries([
    ...[...is].filter((id) => !was.has(id)).map((id) => [id, null]),
    ...[...was].filter((id) => !is.has(id)).map((id) => [id, SPECTATORS]),
  ]);
};
