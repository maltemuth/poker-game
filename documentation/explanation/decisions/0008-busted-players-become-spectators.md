# 0008. Players without chips become spectators

Status: Accepted
Date: 2026-10-04

## Context

A player who loses every chip can't be dealt in. They could keep their seat and sit out until they buy in again, or lose the seat ([Texas Hold'em design](../designs/holdem.md#open-questions)).

## Decision

- **At the end of a hand, a seated player without chips is stood up** and becomes a spectator.
- **To play again, they sit down with a new buy-in,** like anyone else, in any free seat.

## Alternatives considered

- **Keeping the seat, sitting out until a rebuy.** Friendlier to a player who wants to continue, but seats can be held by players who don't, and it needs a rebuy action and a limit on how long a seat is held.

## Consequences

- No player at the table ever has an empty stack between hands.
- Their seat is free for someone else at once.
