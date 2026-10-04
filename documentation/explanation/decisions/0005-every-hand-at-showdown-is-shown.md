# 0005. Every hand that reaches showdown is shown

Status: Accepted; all-in hands are tabled before showdown since [0015](0015-all-in-hands-are-tabled.md)
Date: 2026-10-04

## Context

At showdown, players compare hands. At a real table, players show in order, starting with the last aggressor, and a player who can't win may muck their cards unseen ([Texas Hold'em design](../designs/holdem.md#showdown)). Showing every hand is simpler and makes hands easier to follow for everyone watching.

## Decision

- **Every player still in the hand at showdown shows their cards,** with their best five cards and the hand type, at the same time.
- **A hand won because everyone else folded isn't shown.** The winner's cards stay hidden.
- **Hands are ranked with poker-hands,** `getBestHand` and `handRank`.

## Alternatives considered

- **Showing in showdown order, with mucking.** Closer to live play, and some players expect it, but it needs actions at showdown, an order to show in, and a rule for when a player may muck.

## Consequences

- Showdown needs no actions: the hand ends as soon as the last betting round does.
- Mucking can be added later as a rule change that only affects which cards are shown.
