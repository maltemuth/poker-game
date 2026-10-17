# Backlog

Planned work for Texas Hold'em, in order. The choices behind it are discussed in the [Texas Hold'em design](documentation/explanation/designs/holdem.md); a milestone that depends on an open question waits for its decision record.

The betting core came first, as plain functions with unit tests; the betting, the pots, the hand, the table, the views and the Remote State plugin are done ([Architecture](documentation/explanation/architecture.md)), and hands start and turns end by themselves. After a server restart, a table with play under way waits for the host to resume it ([0018](documentation/explanation/decisions/0018-tables-are-interrupted-by-a-restart.md)).

Each milestone lists the pages it writes or updates ([Writing documentation](documentation/README.md#writing-documentation)). A milestone is done when its tests pass and its pages describe what was built. Remove a milestone when it's done.

## 1. A table to play at

- [ ] A host server: create a table, admit people, serve a minimal web client.
- [ ] The client: seats, cards, pots, the actions allowed for the viewer, the turn countdown.
- Pages: tutorial _Play your first hand_, how-to _Build a client_.

## Later

- Tournaments: rising blinds with a `blinds` timer, and a payout when one player is left.
- [Tri-Coin Hold'em](documentation/explanation/designs/tri-coin.md), on the same dealing, seating and showdown.
- Odds for the viewer's own cards against unknown hands, in the client. The odds of known hands, in all-in runouts and for spectators who see the hole cards, are done ([Odds](documentation/reference/odds.md)).
- Mucking at showdown, run-it-twice, antes and straddles.
- Replacing `poker-ui` (React 16, Create React App, poker-hands 0.3), or reusing parts of it for the client.
