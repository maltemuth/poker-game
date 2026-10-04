# 0015. All-in hands are tabled, and the runout is dealt one betting round at a time

Status: Accepted
Date: 2026-10-04

## Context

When everyone still in a hand is all-in, or only one of them has chips left, no more betting is possible: the rest of the board only has to be dealt. Every hand was shown only at the end, after the whole board ([0005](0005-every-hand-at-showdown-is-shown.md)), and the board was dealt at once. At a real table, the hands are turned face up as soon as the betting is over, and the cards come one by one; players and spectators follow each hand's chances as they do.

## Decision

- **As soon as no more betting is possible,** with at least two players still in and board cards to come, the hands still in are tabled: everyone sees them.
- **The rest of the board is dealt one betting round's cards at a time:** the flop, then the turn, then the river. A timer named `runout` deals each, after the table option `runoutDelay`, in milliseconds, 2,000 by default. With `null`, the rest of the board is dealt at once, as before.
- **The odds are the client's.** `poker-game/odds` computes each tabled hand's chances on the board so far, with `@malte.muth/poker-hands-wasm`; the rules don't compute or store them.
- **The rest of [0005](0005-every-hand-at-showdown-is-shown.md) stands:** at showdown every hand still in is shown, and a hand won because everyone else folded isn't.

## Alternatives considered

- **Computing the odds on the server** and putting them in the views. Every view of every runout step would wait for an exact calculation of up to 0.2 seconds, though only clients that show odds need them.
- **Showing odds only at the end,** replaying the hand. No rule changes, but the moment that's exciting to watch is the runout itself.

## Consequences

- A hand can wait for the `runout` timer, with no one to act. The turn timer isn't running then, and no next hand can start.
- Views show tabled hands' cards, and say when a hand is tabled.
- The odds module adds the WebAssembly package for clients that use it; the rules and the plugin don't load it.
