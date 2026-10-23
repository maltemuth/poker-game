# 0012. The host controls the table

Status: Accepted; a pause freezes the hand being played since [0023](0023-a-pause-freezes-the-hand.md)
Date: 2026-10-04

## Context

Someone has to start each hand, and a table may need to stop for a while. Players could do it, or an owner among them, or the host through Remote State's `act`, which runs actions as the system ([Texas Hold'em design](../designs/holdem.md#who-controls-the-table)). Timers will start hands by themselves later; until then, something else must.

## Decision

- **Starting a hand, pausing and resuming are system actions,** `startHand`, `pause` and `resume`. Only the system may send them: the host through `act`, and later the timers.
- **A paused table deals no new hands.** A hand being played when it's paused is played to the end.
- **Players can't send system actions,** and the system can't act for a player.
- **Closing a table** waits for Remote State's design of a game's lifecycle.

## Alternatives considered

- **An owner in the state,** who may start, pause and close the table from the client. Needs a role and a way to hand it on when the owner leaves.
- **Any player starting the next hand.** Simple, but any player could rush the others.

## Consequences

- Until the timers, a host starts every hand with `act(gameId, { type: "startHand" })`.
- The table has a `paused` flag.
