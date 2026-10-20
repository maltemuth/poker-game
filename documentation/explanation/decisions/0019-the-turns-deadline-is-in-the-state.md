# 0019. The turn's deadline is in the state

Status: Accepted
Date: 2026-10-20

## Context

Players need to see how long they, or the player they're waiting for, have left in a turn. The views carried the turn number, which changes with every new turn, and the table options the turn's length ([0014](0014-a-turn-that-runs-out-folds.md)), so a client could start a countdown when it saw a new turn. A client that connects, reloads or wakes up halfway through a turn can't: it doesn't know when the turn began. Remote State's view filter must depend only on the state and the audience, with no clock, so the time can't be added when a view is made.

## Decision

- **The table keeps when the turn runs out,** `turnDeadline`, in milliseconds since the epoch. Views carry it as it is.
- **The plugin sets it as it schedules the turn timer:** the time now plus the table's `turnTimeout`. Cancelling the timer clears it, and actions that leave the timer alone leave it alone.
- **It's null while no turn is timed:** before a hand, between hands, during a paced runout, at a table without `turnTimeout`, and while the table is interrupted. Resuming sets it again, with the turn's full time, as the timer starts over ([0018](0018-tables-are-interrupted-by-a-restart.md)).
- **The clock is a plugin option, `now`,** `Date.now` unless given, so tests can fix the time, as `draw` fixes the cards.

## Alternatives considered

- **When the turn began,** instead of when it ends. Clients would add `turnTimeout` themselves, and the deadline would be wrong if the timer were ever scheduled for anything but the full time.
- **The time left,** in milliseconds. It changes all the time, so it can't be in a state, and goes stale the moment it's sent.

## Consequences

- A countdown is right after a reload, as far as the client's clock agrees with the server's. A client whose clock is off counts down early or late; it can estimate the difference, for example from the `Date` header of a response.
- Every new turn changes the table's state in one more place.
- Tables stored before this have no `turnDeadline`; they must be started over, as Remote State's databases are before its 1.0.
