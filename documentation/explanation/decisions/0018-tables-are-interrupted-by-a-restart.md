# 0018. A restart interrupts a table until the host resumes it

Status: Accepted
Date: 2026-10-17

## Context

Remote State keeps timers in memory, so a server restart loses the `nextHand`, `turn` and `runout` timers ([its 0042](../../../../remote-state/docs/explanation/decisions/0042-timer-restarts-open.md)). Without them, a table stops: the next hand never starts, a runout never deals its next cards, and a turn has no limit. Worse, the first player back who acts starts the next player's clock, whether or not that player has reconnected.

The [design](../designs/holdem.md#time-limits) proposed that the host resume every open table after a restart, keeping the tables' IDs to find them. Remote State now offers every stored game to the plugin's `onRestart` when it starts ([its 0052](../../../../remote-state/docs/explanation/decisions/0052-games-pause-on-restart.md)), so the host doesn't have to.

## Decision

- **A restart interrupts a table that had a timer to lose:** one whose next hand was startable with a `nextHandDelay`, whose turn was running with a `turnTimeout`, or whose runout waited with a `runoutDelay`. Other tables are left as they were, and nothing is recorded for them.
- **Nothing happens at an interrupted table:** no player acts, and no hand starts, times out or runs out. Every such action is refused with `The table is waiting for the host to resume it`, and the view lists no buttons. People can still join, as spectators.
- **Only the host resumes it,** with the existing system action `resume`, once everyone is back. Resuming schedules every timer the table calls for, each with its full time: for a turn, that's right, since its player may only just have reconnected.
- **It's separate from the host's pause** ([0012](0012-host-controls-the-table.md)), which only stops new hands. A table can be both; `resume` ends the interruption first, and the pause with a second `resume`.

## Alternatives considered

- **Reusing the pause.** It lets a hand being played go on, so the first player back would start the others' clocks.
- **The host resumes every open table after a restart, as proposed.** Needs the host to keep its tables' IDs; with `onRestart`, the tables mark themselves.
- **A player claims a timeout once a stored deadline has passed.** Works without the host, but makes `validateAction` depend on the clock, and still runs on before everyone is back.
- **Resuming by itself once every seated player has reconnected.** Remote State doesn't tell the game who's connected.

## Consequences

- After a restart, a table with play under way waits for the host. Until a host has a way to resume tables, that's done with `act`.
- Clients see `interrupted` in the view, and can say that the table waits for the host.
- Every restart offers every table to the plugin, finished ones too, which costs one read of each.
