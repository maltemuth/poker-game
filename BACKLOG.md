# Backlog

Planned work for Texas Hold'em, in order. The choices behind it are discussed in the [Texas Hold'em design](documentation/explanation/designs/holdem.md); a milestone that depends on an open question waits for its decision record.

The betting core comes first, as plain functions with unit tests; the betting, the pots, the hand, the table and the views are done ([Rules as implemented](documentation/reference/rules.md), [State and views](documentation/reference/state-and-views.md)). Remote State isn't used until the plugin, and timers come last.

Each milestone lists the pages it writes or updates ([Writing documentation](documentation/README.md#writing-documentation)). A milestone is done when its tests pass and its pages describe what was built. Remove a milestone when it's done.

## 1. The plugin

Adds Remote State as a dependency, by local path until it's on npm. Depends on: audiences.

- [ ] `createHoldemPlugin({ random })`: `onJoin` as a spectator, `validateAction` and `executeAction` over the rules, audiences for seated players and spectators, the view filter.
- [ ] Pause, resume and close through the host's `act`.
- [ ] Integration tests through Remote State's HTTP API with supertest: admission, seating, a full hand, views.
- Pages: explanation _Architecture_, how-to _Host a table_.

## 2. Time limits

Depends on: time limits.

- [ ] The `turn` timer: rescheduled by every action, with the deadline in the state. A stale timeout is rejected.
- [ ] On timeout, check or fold, and sit out after two timeouts in a row.
- [ ] The `nextHand` timer, and starting a hand when the second player sits down.
- [ ] `resume` for the host after a restart, scheduling the timers the state calls for. The host keeps the IDs of its open tables to find them.
- Pages: reference _Timers_, how-to _Set the time limits_, how-to _Resume tables after a restart_.

## 3. A table to play at

- [ ] A host server: create a table, admit people, serve a minimal web client.
- [ ] The client: seats, cards, pots, the actions allowed for the viewer, the turn countdown.
- Pages: tutorial _Play your first hand_, how-to _Build a client_.

## Later

- Tournaments: rising blinds with a `blinds` timer, and a payout when one player is left.
- [Tri-Coin Hold'em](documentation/explanation/designs/tri-coin.md), on the same dealing, seating and showdown.
- Odds for the viewer's own cards in the client, with `@malte.muth/poker-hands-wasm`.
- Mucking at showdown, run-it-twice, antes and straddles.
- Replacing `poker-ui` (React 16, Create React App, poker-hands 0.3), or reusing parts of it for the client.
