# 0014. A turn that runs out folds; its length is a table option

Status: Accepted; views carry the turn's deadline since [0019](0019-the-turns-deadline-is-in-the-state.md)
Date: 2026-10-04

## Context

A player who doesn't act holds up the table, whether they've left or are thinking. Remote State's timers can end a turn ([Remote State's 0041](../../../../remote-state/docs/explanation/decisions/0041-named-timers.md)). A timeout could check when nothing is owed, fold, or put the player on a break, and tables differ in how long a turn may take ([Texas Hold'em design](../designs/holdem.md#time-limits)).

## Decision

- **When a turn runs out, the player folds,** even if they could check.
- **The length is a table option, `turnTimeout`,** in milliseconds, 30,000 by default. With `null`, turns have no limit.
- **A timer named `turn` is scheduled whenever a new turn begins:** a hand is dealt, or a player acts and someone else is to act. It's cancelled when no one is to act.
- **Turns are numbered:** the table counts hands, each hand counts the actions taken in turn. The timeout carries both numbers, and is rejected once that turn is over. A fold out of turn, by a player who leaves or takes a break, doesn't start a new turn, so it doesn't give the player to act more time.
- **Nothing else happens after a timeout.** A player who times out again and again keeps being dealt in.

## Alternatives considered

- **Checking when nothing is owed, folding otherwise.** Kinder to a slow player, but an absent player then stays in hands they never play.
- **A break after timeouts in a row.** Keeps absent players out of hands, but wasn't wanted yet.

## Consequences

- The state has a hand counter on the table and a turn counter in the hand.
- Timers are lost when the server restarts ([Remote State's 0042](../../../../remote-state/docs/explanation/decisions/0042-timer-restarts-open.md)): a turn that was running has no timeout until the next action.
- Clients can show a countdown: the views carry the turn number, which changes with every new turn, and the length is in the table options.
