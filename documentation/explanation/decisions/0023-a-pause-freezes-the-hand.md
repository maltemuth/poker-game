# 0023. A pause freezes the hand being played

Status: Accepted
Date: 2026-10-23

## Context

A paused table dealt no new hands, but a hand being played went on to the end ([0012](0012-host-controls-the-table.md)): its turn timer kept running, and a player who had stepped away was folded when their time ran out. Hosts pause because someone has to step away, often in the middle of a hand. A restart already stops everything at a table until the host resumes it ([0018](0018-tables-are-interrupted-by-a-restart.md)).

## Decision

- **Pausing during a hand freezes it** until the host resumes the table. No one bets, and players dealt in can't leave or take a break, since either would fold their hand. Anyone can still sit down or sit in, which waits for the next hand anyway.
- **No timer runs for a frozen hand.** The turn timer is cancelled, and so is the next step of a paced all-in runout. The next hand's timer was already cancelled by the pause.
- **The turn keeps the time it had left.** The table stores it as `turnTimeLeft`, in milliseconds, and `turnDeadline` is null while the hand is frozen. Resuming schedules the turn timer with that time, and sets `turnDeadline` from it. A runout step starts over with the full `runoutDelay`.
- **Views carry `turnTimeLeft`,** so a client can show a stopped clock, and `you.buttons` is empty while the hand is frozen.
- **Pausing between hands is as before:** no hand is dealt until the host resumes the table.

## Alternatives considered

- **Stopping only the clock,** and letting players act. A player who stepped away couldn't be timed out, but the others could go on and change the hand without them, and each new turn would need a clock that doesn't run.
- **A full turn on resume,** as after a restart. Simpler, with no time to store, but pausing and resuming would hand the player to act more time.

## Consequences

- A host can stop a hand at any moment, and nobody loses their hand to the clock while the table waits.
- A restart while a hand is frozen interrupts nothing, since no timer is running; resuming afterwards still gives the turn its time left.
- Tables stored before this have no `turnTimeLeft`; they must be started over, as Remote State's databases are before its 1.0.
