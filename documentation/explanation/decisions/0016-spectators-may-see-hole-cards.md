# 0016. Spectators may see the hole cards, if the table allows it

Status: Accepted
Date: 2026-10-04

## Context

Watching poker is more fun when the hole cards are known: broadcasts show every hand, and each hand's chances, while it's played. Spectators see no hole cards until they're tabled or shown ([0015](0015-all-in-hands-are-tabled.md)). But anyone who sees the hole cards during a hand can tell a player at the table: a player could even watch their own table from a second account.

## Decision

- **The table option `spectatorsSeeHoleCards`,** off by default, shows the spectators' view every hole card of the hand being played, from the deal.
- **Players never see other players' hole cards** before they're tabled or shown, whatever the option.
- **The odds module works for any view in which every hand still in is known:** a tabled runout for everyone, or the whole hand for spectators at such a table.

## Alternatives considered

- **Showing the hole cards to spectators with a delay,** as broadcasts do. Safer, but views must depend only on the state, not the clock, so a delay would need the state to remember what was shown when.
- **Never showing them.** Safe, but loses what makes watching interesting.

## Consequences

- At such a table, everyone in the spectators' audience sees the hole cards, including players who have just left the table. Hosts should turn it on only where that's acceptable, such as tables for friends or for teaching.
- The hidden-cards check allows the spectators' view all hole cards at such tables, and still none to players.
