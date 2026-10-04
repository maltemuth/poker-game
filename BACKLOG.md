# Backlog

Planned work for Texas Hold'em, in order. The choices behind it are discussed in the [Texas Hold'em design](documentation/explanation/designs/holdem.md); a milestone that depends on an open question waits for its decision record.

The betting core came first, as plain functions with unit tests; the betting, the pots, the hand, the table, the views and the Remote State plugin are done ([Architecture](documentation/explanation/architecture.md)), and hands start and turns end by themselves.

Each milestone lists the pages it writes or updates ([Writing documentation](documentation/README.md#writing-documentation)). A milestone is done when its tests pass and its pages describe what was built. Remove a milestone when it's done.

## 1. Timers after a restart

The `nextHand` and `turn` timers are done ([0013](documentation/explanation/decisions/0013-hands-start-by-themselves.md), [0014](documentation/explanation/decisions/0014-a-turn-that-runs-out-folds.md), [Timers](documentation/reference/timers.md)). Remote State loses timers when the server restarts, and how they should come back is open there ([its 0042](../remote-state/docs/explanation/decisions/0042-timer-restarts-open.md)).

- [ ] A system action with which the host brings back the timers a table's state calls for, after a restart: the next hand's, or the current turn's, with its full time. The host keeps the IDs of its open tables to find them.
- Pages: how-to _Resume tables after a restart_, reference _Timers_.

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
