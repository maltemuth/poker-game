# 0006. How new players join a running game is a table option

Status: Accepted
Date: 2026-10-04

## Context

A player who sits down while a game is running could be dealt in at once, without paying blinds, though they'd have skipped the blinds the others paid. Card rooms handle this differently, and tables differ in how strict they want to be ([Texas Hold'em design](../designs/holdem.md#open-questions)).

## Decision

The table option `newPlayers` decides, with three choices:

| Choice                     | A new player…                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `"nextHand"` (the default) | is dealt in from the next hand, without posting anything                                                            |
| `"waitForBigBlind"`        | sits out until the big blind reaches their seat, and is dealt in as the big blind                                   |
| `"postBigBlind"`           | posts a big blind in their first hand, wherever they sit, as a live bet; in the small blind's seat they wait a hand |

- **"Running" means at least two other players are being dealt in.** At a table that's starting, everyone who sits down is dealt in from the next hand, whatever the option.
- **The button moves only among players who are dealt in** ([0007](0007-moving-button.md)), so a waiting player never gets it.

## Alternatives considered

- **One rule for every table.** Simpler, but "dealt in next hand" lets players skip the blinds by hopping seats, and the stricter rules slow down casual tables.

## Consequences

- Seated players carry a `newPlayer` flag until they're dealt in.
- Blinds can include extra big blinds from new players, which are live bets: the poster may check if no one raises.
- The reference lists the option with the table options.
