# Timers

The Remote State timers the plugin schedules. A due timer runs its action as the system, through the same checks as any action ([Remote State: Timers](../../../remote-state/docs/reference/game-plugin.md#timers)). Timers are kept in memory: a server restart loses them, and interrupts a table that had one running until the host resumes it, which schedules them again ([After a restart](#after-a-restart)).

| Name       | Action                                                                                | Scheduled                                                                                              | Cancelled                                                                                            | Delay                                                           |
| ---------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `nextHand` | `{ type: "startHand" }`                                                               | When an action makes a hand startable: a hand is over, a second player sits down, the table is resumed | When a hand stops being startable: a hand starts, players leave or take a break, the table is paused | The table's `nextHandDelay` ([Table options](table-options.md)) |
| `turn`     | `{ type: "timeout", hand, turn }`: the player to act folds                            | Whenever a new turn begins: a hand is dealt, or a player acts and someone else is to act               | When no one is to act any more                                                                       | The table's `turnTimeout`                                       |
| `runout`   | `{ type: "runout", hand, board }`: the next betting round's cards of an all-in runout | When a hand waits for the next runout cards: the hands are tabled, and after each step but the last    | When the hand stops waiting, such as when it ends                                                    | The table's `runoutDelay`                                       |

A hand is startable when no hand is being played, the table isn't paused or interrupted, and at least two players can be dealt in ([Actions: System actions](actions.md#system-actions)).

- **Actions that change neither leave a pending timer alone:** people sitting down during the delay don't push the next hand back.
- **A hand the blinds play out at once,** when everyone is all-in from the blinds, schedules the timer again.
- **With `nextHandDelay` set to `null`,** no timer is scheduled, and the host starts each hand with `act` ([0013](../explanation/decisions/0013-hands-start-by-themselves.md)).

## The turn timer

A turn that runs out folds the player to act, even if they could check ([0014](../explanation/decisions/0014-a-turn-that-runs-out-folds.md)).

- **Turns are numbered:** `hand` is the table's hand number, `turn` the hand's turn counter. Every action in turn begins a new turn; a fold out of turn, by a player who leaves or takes a break, doesn't, so it doesn't give the player to act more time.
- **A timeout for a turn that's over is rejected** with `That turn is over`, and changes nothing.
- **With `turnTimeout` set to `null`,** turns have no limit.
- **Clients can show a countdown:** views carry `hand.turn`, which changes with every new turn, and the table options carry `turnTimeout`.

## The runout timer

Once no more betting is possible, the hands still in are tabled, and the rest of the board is dealt one betting round's cards at a time ([0015](../explanation/decisions/0015-all-in-hands-are-tabled.md)).

- **Steps are named** by the table's hand number and the board cards dealt so far; a step that's out of date is rejected with `That runout step is over`.
- **The river comes with the showdown,** in the last step.
- **While the hand waits,** no one is to act: the turn timer isn't running, and no hand can start.
- **With `runoutDelay` set to `null`,** the rest of the board is dealt at once, and the hands are still tabled.

## After a restart

When Remote State starts on a database that already has tables, it offers each to the plugin ([0018](../explanation/decisions/0018-tables-are-interrupted-by-a-restart.md)). A table that calls for a timer, by the conditions above, is interrupted: no timer runs and no one acts until the host sends `resume`. Resuming schedules every timer the table calls for, each with its full delay: the current turn starts over. A table that calls for none is left as it was.
