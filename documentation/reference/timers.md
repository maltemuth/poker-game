# Timers

The Remote State timers the plugin schedules. A due timer runs its action as the system, through the same checks as any action ([Remote State: Timers](../../../remote-state/docs/reference/game-plugin.md#timers)). Timers are kept in memory: a server restart loses them.

| Name       | Action                  | Scheduled                                                                                              | Cancelled                                                                                            | Delay                                                           |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `nextHand` | `{ type: "startHand" }` | When an action makes a hand startable: a hand is over, a second player sits down, the table is resumed | When a hand stops being startable: a hand starts, players leave or take a break, the table is paused | The table's `nextHandDelay` ([Table options](table-options.md)) |

A hand is startable when no hand is being played, the table isn't paused, and at least two players can be dealt in ([Actions: System actions](actions.md#system-actions)).

- **Actions that change neither leave a pending timer alone:** people sitting down during the delay don't push the next hand back.
- **A hand the blinds play out at once,** when everyone is all-in from the blinds, schedules the timer again.
- **With `nextHandDelay` set to `null`,** no timer is scheduled, and the host starts each hand with `act` ([0013](../explanation/decisions/0013-hands-start-by-themselves.md)).

A turn timer is planned ([BACKLOG.md](../../BACKLOG.md)).
