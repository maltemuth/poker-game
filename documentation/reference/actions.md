# Actions

What players send to act at a table, and what the betting buttons are translated into ([0002](../explanation/decisions/0002-fold-or-bet-to.md)).

## At the table

A player's action at a table is a `TableAction`: a seating action, or a betting button.

```ts
type TableAction =
  | { type: "sitDown"; seat: number; buyIn: number } // seat numbers start at 1
  | { type: "standUp" } // a break
  | { type: "sitIn" }
  | { type: "leave" }
  | UiAction; // the betting buttons, below
```

| Function                                                                                 | Returns                                                                     |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`checkTableAction(table, playerId, action)`](../../src/table/checkTableAction.ts)       | `true`, or the reason the action is rejected                                |
| [`applyTableAction(table, playerId, action, draw)`](../../src/table/applyTableAction.ts) | The table after the action. Throws if `checkTableAction` rejects the action |

`draw` deals the board cards a betting action may bring ([Test the rules with a fixed deck](../how-to/test-with-a-fixed-deck.md)). People join a table as spectators, with [`addSpectator(table, person)`](../../src/table/addSpectator.ts), and hands are started by the host, with [`startNextHand(table, draw)`](../../src/table/startNextHand.ts); neither is a player's action.

### Seating

| Action    | What it does                                                                                                                                                                                                                                   | Reasons it's rejected                                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sitDown` | A spectator takes a free seat with a buy-in. If a game is running, they're a new player ([Table options](table-options.md#newplayers))                                                                                                         | `You already have a seat`, `Only people at the table can sit down`, `There's no seat <n>`, `Seat <n> is taken`, `The buy-in must be a whole number of chips from <min> to <max>` |
| `standUp` | A break: the player keeps their seat and chips, and isn't dealt in until they sit in again. During a hand they can still act in, it folds their hand at once, in turn or not ([0010](../explanation/decisions/0010-standing-up-is-a-break.md)) | `You don't have a seat`, `You're already on a break`                                                                                                                             |
| `sitIn`   | Back from a break: the player is dealt in again from the next hand                                                                                                                                                                             | `You don't have a seat`, `You aren't on a break`                                                                                                                                 |
| `leave`   | The player leaves with their chips and becomes a spectator. During a hand they can still act in, it folds their hand at once; they become a spectator when the hand is over, since their seat is part of it until then                         | `You don't have a seat`                                                                                                                                                          |

### Betting at the table

A betting button is accepted only from the player to act in the hand being played. Before it's translated, it can be rejected with `No hand is being played`, `You aren't in this hand` or `It's not your turn`. When an action ends the hand, the hand is settled onto the table at once ([Rules](rules.md#between-hands)).

Any other `type` is rejected with `Unknown action`.

## System actions

In Remote State, the plugin also takes actions only the system may send: the host through `act`, and the [timers](timers.md) ([0012](../explanation/decisions/0012-host-controls-the-table.md)). The `nextHand` timer sends `startHand`, the `turn` timer `timeout`, and the `runout` timer `runout`.

```ts
type SystemAction =
  | { type: "startHand" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "setOptions"; options: OptionChanges }; // every option but seats, each optional
```

| Action       | What it does                                                                                                                            | Reasons it's rejected                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `startHand`  | Deals the next hand ([Rules](rules.md#between-hands))                                                                                   | `A hand is being played`, `The table is paused`, `Waiting for players`, an interrupted table                      |
| `pause`      | No new hands are dealt; a hand being played goes on                                                                                     | `The table is already paused`                                                                                     |
| `resume`     | Ends an interruption, scheduling the table's timers again; otherwise, hands can be dealt again                                          | `The table isn't paused`                                                                                          |
| `setOptions` | Changes the options given, before the first hand; the others keep their values ([Table options](table-options.md#changing-the-options)) | `The options can't change once a hand has been dealt`, `A table's seats can't change`, `Invalid table options: …` |
| `timeout`    | The player to act folds: their turn ran out ([Timers](timers.md#the-turn-timer))                                                        | `That turn is over`                                                                                               |
| `runout`     | Deals the next betting round's cards of an all-in runout ([Timers](timers.md#the-runout-timer))                                         | `That runout step is over`                                                                                        |

After a server restart, a table that had a timer running is interrupted: every player action, `startHand`, `timeout` and `runout` is rejected with `The table is waiting for the host to resume it`, until the host sends `resume` ([0018](../explanation/decisions/0018-tables-are-interrupted-by-a-restart.md)). If the table was also paused, a second `resume` ends the pause.

A player who sends a system action gets `Only the host can do that`; the system sending a player's action gets `The system can't act for a player`.

## Buttons

Clients send the button a player clicked, a `UiAction`:

```ts
type UiAction =
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  | { type: "raise"; to: number } // total in this betting round; also a first bet
  | { type: "allIn" };
```

[`translateUiAction(round, uiAction)`](../../src/ui/translateUiAction.ts) turns it into a rule action for the player to act, or returns the reason it doesn't apply:

| Button  | Becomes                                                                     | Reason when it doesn't apply                                                            |
| ------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `fold`  | `{ type: "fold" }`                                                          |                                                                                         |
| `check` | A bet to what the player already has in                                     | `You can't check: there's <owed> to call`                                               |
| `call`  | A bet to the call                                                           | `There's nothing to call; you can check`                                                |
| `raise` | A bet to `to`                                                               | `A raise must be to more than <call>`                                                   |
| `allIn` | A bet to everything: a call if that's all the call takes, otherwise a raise | The rules' reason why raising isn't allowed ([Rules](rules.md#when-raising-is-allowed)) |

For every button: `The betting round is over` when no one is to act, and `Unknown action` for any other `type`.

A `raise` is translated whatever its amount, so the rules check it: a raise below the minimum is rejected by `checkAction`, with the rules' reason ([Rules](rules.md#rejections)).

## Rule actions

What the betting rules take, a `BettingAction`:

```ts
type BettingAction = { type: "fold" } | { type: "bet"; to: number }; // the player's total bet in this betting round
```

| Function                                                         | Returns                                                                |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`checkAction(round, action)`](../../src/betting/checkAction.ts) | `true`, or the reason the action is rejected                           |
| [`applyAction(round, action)`](../../src/betting/applyAction.ts) | The round after the action. Throws if `checkAction` rejects the action |

## Buttons to show

[`availableUiActions(round)`](../../src/ui/availableUiActions.ts) lists the buttons for the player to act, in this order, or nothing when the round is over:

```ts
type UiOption =
  | { type: "fold" }
  | { type: "check" }
  | { type: "call"; amount: number; allIn: boolean }
  | { type: "raise"; min: number; max: number; firstBet: boolean }
  | { type: "allIn"; to: number };
```

| Option  | Listed             | Fields                                                                                                      |
| ------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `fold`  | Always             |                                                                                                             |
| `check` | Nothing is owed    |                                                                                                             |
| `call`  | Something is owed  | `amount`: the chips the call adds. `allIn`: the call takes everything the player has                        |
| `raise` | Raising is allowed | `min`, `max`: totals in this betting round. `firstBet`: no one has bet in the betting round; label it "bet" |
| `allIn` | Raising is allowed | `to`: everything the player has, as a total                                                                 |

When the player can't cover the call, there's no `allIn` option: the `call` is the all-in, with `allIn: true`.

Every listed option translates into an action `checkAction` accepts; for `raise`, any total from `min` to `max`.
