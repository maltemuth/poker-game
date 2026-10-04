# 0013. Hands start by themselves, after a delay

Status: Accepted
Date: 2026-10-04

## Context

The host starts every hand through `act` ([0012](0012-host-controls-the-table.md)), so every host needs its own loop to keep a table going. Remote State's timers run an action as the system after a delay ([Remote State's 0041](../../../../remote-state/docs/explanation/decisions/0041-named-timers.md)). Players need a moment after a hand to see who won.

## Decision

- **A timer named `nextHand` runs `startHand`** once a hand can be started: after a hand is over, when the second player sits down, or when the table is resumed.
- **The delay is a table option, `nextHandDelay`,** in milliseconds, 5,000 by default. With `null`, no timer is scheduled, and the host starts hands as before.
- **The timer is scheduled only when an action makes a hand startable,** and cancelled when one stops being so: a hand is started some other way, players leave, or the table is paused. Other actions leave a pending timer alone, so people sitting down during the delay don't push the next hand back.
- **When it fires, `startHand` is checked like any action,** so a timer that's out of date is rejected.

## Alternatives considered

- **Starting the next hand at once** when one ends. No one would see the showdown.
- **Rescheduling the timer with every action.** Simpler, but every arrival would delay the hand again.

## Consequences

- A host only creates tables and admits people; hands run by themselves.
- Timers are lost when the server restarts ([Remote State's 0042](../../../../remote-state/docs/explanation/decisions/0042-timer-restarts-open.md)): a table then waits until the host starts a hand, or an action makes one startable again.
