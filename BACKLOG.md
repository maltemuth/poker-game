# Backlog

Planned work for Texas Hold'em, in order. The choices behind it are discussed in the [Texas Hold'em design](documentation/explanation/designs/holdem.md); a milestone that depends on an open question waits for its decision record.

The betting core came first, as plain functions with unit tests; the betting, the pots, the hand, the table, the views and the Remote State plugin are done ([Architecture](documentation/explanation/architecture.md)). Timers come next.

Each milestone lists the pages it writes or updates ([Writing documentation](documentation/README.md#writing-documentation)). A milestone is done when its tests pass and its pages describe what was built. Remove a milestone when it's done.

## 1. Time limits

Depends on: time limits.

- [ ] The `turn` timer: rescheduled by every action, with the deadline in the state. A stale timeout is rejected.
- [ ] On timeout, check or fold, and sit out after two timeouts in a row.
- [ ] The `nextHand` timer, and starting a hand when the second player sits down.
- [ ] `resume` for the host after a restart, scheduling the timers the state calls for. The host keeps the IDs of its open tables to find them.
- Pages: reference _Timers_, how-to _Set the time limits_, how-to _Resume tables after a restart_.

## 2. A table to play at

- [ ] A host server: create a table, admit people, serve a minimal web client.
- [ ] The client: seats, cards, pots, the actions allowed for the viewer, the turn countdown.
- Pages: tutorial _Play your first hand_, how-to _Build a client_.

## Later

- Tournaments: rising blinds with a `blinds` timer, and a payout when one player is left.
- [Tri-Coin Hold'em](documentation/explanation/designs/tri-coin.md), on the same dealing, seating and showdown.
- Odds for the viewer's own cards in the client, with `@malte.muth/poker-hands-wasm`.
- Mucking at showdown, run-it-twice, antes and straddles.
- Replacing `poker-ui` (React 16, Create React App, poker-hands 0.3), or reusing parts of it for the client.
