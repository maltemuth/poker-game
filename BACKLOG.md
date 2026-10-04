# Backlog

Planned work for Texas Hold'em, in order. The choices behind it are discussed in the [Texas Hold'em design](documentation/explanation/designs/holdem.md); a milestone that depends on an open question waits for its decision record.

The betting core comes first, as plain functions with unit tests; the betting and the pots are done ([Rules as implemented](documentation/reference/rules.md)). Remote State isn't used until the plugin, and timers come last.

Each milestone lists the pages it writes or updates ([Writing documentation](documentation/README.md#writing-documentation)). A milestone is done when its tests pass and its pages describe what was built. Remove a milestone when it's done.

## 1. The hand

Adds poker-hands as a dependency, by local path until 0.12 or later is on npm. Depends on: cards as strings, the deck, showdown.

- [ ] Cards as strings. Dealing from the cards still out with an injected random source; tests use a fixed deck.
- [ ] A hand from the blinds to showdown: hole cards, the four betting rounds, and dealing the flop, turn and river as each round closes. The rest of the board is dealt when no more betting is possible.
- [ ] Showdown: ranks from poker-hands, then the pots awarded with `awardPots`. The hand ends early when one player is left.
- [ ] Tests: scripted hands from a fixed deck.
- Pages: how-to _Test the rules with a fixed deck_, reference _Rules as implemented_ (showdown).

## 2. The table

Depends on: joining a running table, the button, busting.

- [ ] `newTable(options)`, checking the blinds, buy-in range and number of seats.
- [ ] Sitting down with a buy-in, standing up, sitting out and in again.
- [ ] The button and blinds moving from hand to hand as players come and go.
- Pages: reference _Table options_, reference _Actions_ (seating).

## 3. Views

- [ ] What each audience sees:
  - each seated player gets their own hole cards;
  - spectators get none;
  - shown hands are visible to everyone;
  - pots are derived for display;
  - nothing about the deck appears.
- [ ] Tests: no view of any state in a scripted hand contains a card its audience mustn't see.
- Pages: reference _State and views_.

## 4. The plugin

Adds Remote State as a dependency, by local path until it's on npm. Depends on: audiences.

- [ ] `createHoldemPlugin({ random })`: `onJoin` as a spectator, `validateAction` and `executeAction` over the rules, audiences for seated players and spectators, the view filter.
- [ ] Pause, resume and close through the host's `act`.
- [ ] Integration tests through Remote State's HTTP API with supertest: admission, seating, a full hand, views.
- Pages: explanation _Architecture_, how-to _Host a table_.

## 5. Time limits

Depends on: time limits.

- [ ] The `turn` timer: rescheduled by every action, with the deadline in the state. A stale timeout is rejected.
- [ ] On timeout, check or fold, and sit out after two timeouts in a row.
- [ ] The `nextHand` timer, and starting a hand when the second player sits down.
- [ ] `resume` for the host after a restart, scheduling the timers the state calls for. The host keeps the IDs of its open tables to find them.
- Pages: reference _Timers_, how-to _Set the time limits_, how-to _Resume tables after a restart_.

## 6. A table to play at

- [ ] A host server: create a table, admit people, serve a minimal web client.
- [ ] The client: seats, cards, pots, the actions allowed for the viewer, the turn countdown.
- Pages: tutorial _Play your first hand_, how-to _Build a client_.

## Later

- Tournaments: rising blinds with a `blinds` timer, and a payout when one player is left.
- [Tri-Coin Hold'em](documentation/explanation/designs/tri-coin.md), on the same dealing, seating and showdown.
- Odds for the viewer's own cards in the client, with `@malte.muth/poker-hands-wasm`.
- Mucking at showdown, run-it-twice, antes and straddles.
- Replacing `poker-ui` (React 16, Create React App, poker-hands 0.3), or reusing parts of it for the client.
