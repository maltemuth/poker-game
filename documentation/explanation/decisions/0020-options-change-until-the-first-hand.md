# 0020. The host can change the options until the first hand

Status: Accepted
Date: 2026-10-20

## Context

A table's options were fixed when it was created ([Table options](../../reference/table-options.md)). A host often only knows what suits the night once people have come to the table: how many chips they want to play for, how quick they are. Changing options during a game raises a question for each option, such as when new blinds apply, or what happens to a turn already being timed, which are left for later. Before the first hand, none of them arise: no hand has been played under the old options.

## Decision

- **The host changes options with a system action, `setOptions`,** sent through `act` like `startHand`, `pause` and `resume` ([0012](0012-host-controls-the-table.md)).
- **Only until the first hand is dealt.** After that, `setOptions` is rejected. When each option may change during a game is to be decided per option.
- **Any option but the number of seats.** Options left out keep their values, and the result is checked like a new table's options.
- **Chips already on the table stay as they are,** also where a new buy-in range wouldn't allow them.
- **The `nextHand` timer follows a new delay:** it starts over with the new `nextHandDelay`, or is cancelled when there's none or no hand can start.

## Alternatives considered

- **Options fixed at creation.** Simplest, but the host has to start a new table, and send a new link, to change anything.
- **Changes during a game, from the next hand.** One rule for every option, but each option needs its own answer, such as what a new buy-in range means for players already seated, and a game in progress is when getting it wrong hurts.

## Consequences

- Views carry the options as always, so everyone at the table sees a change at once.
- A player who bought in under the old range may have more or fewer chips than the new range allows.
- The checks for options are shared by `newTable` and `setOptions`, and exported as `optionProblems`, so a client can check options before sending them.
