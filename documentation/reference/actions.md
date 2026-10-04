# Actions

What players send to act at a table, and what the betting buttons are translated into ([0002](../explanation/decisions/0002-fold-or-bet-to.md)).

## At the table

A player's action at a table is a `TableAction`: a seating action, or a betting button.

```ts
type TableAction =
  | { type: "sitDown"; seat: number; buyIn: number } // seat numbers start at 1
  | { type: "standUp" }
  | { type: "sitOut" }
  | { type: "sitIn" }
  | UiAction; // the betting buttons, below
```

| Function                                                                                 | Returns                                                                     |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`checkTableAction(table, playerId, action)`](../../src/table/checkTableAction.ts)       | `true`, or the reason the action is rejected                                |
| [`applyTableAction(table, playerId, action, draw)`](../../src/table/applyTableAction.ts) | The table after the action. Throws if `checkTableAction` rejects the action |

`draw` deals the board cards a betting action may bring ([Test the rules with a fixed deck](../how-to/test-with-a-fixed-deck.md)). People join a table as spectators, with [`addSpectator(table, person)`](../../src/table/addSpectator.ts), and hands are started by the host, with [`startNextHand(table, draw)`](../../src/table/startNextHand.ts); neither is a player's action.

### Seating

| Action    | What it does                                                                                                                                                                                                                                     | Reasons it's rejected                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sitDown` | A spectator takes a free seat with a buy-in. If a game is running, they're a new player ([Table options](table-options.md#newplayers))                                                                                                           | `You already have a seat`, `Only people at the table can sit down`, `There's no seat <n>`, `Seat <n> is taken`, `The buy-in must be a whole number of chips from <min> to <max>` |
| `standUp` | The player becomes a spectator with their chips. During a hand they were dealt into, it folds their hand at once, in turn or not, and they become a spectator when the hand is over ([0009](../explanation/decisions/0009-standing-up-folds.md)) | `You don't have a seat`                                                                                                                                                          |
| `sitOut`  | The player keeps their seat and chips, but isn't dealt in from the next hand                                                                                                                                                                     | `You don't have a seat`, `You're already sitting out`                                                                                                                            |
| `sitIn`   | The player is dealt in again from the next hand                                                                                                                                                                                                  | `You don't have a seat`, `You aren't sitting out`                                                                                                                                |

### Betting at the table

A betting button is accepted only from the player to act in the hand being played. Before it's translated, it can be rejected with `No hand is being played`, `You aren't in this hand` or `It's not your turn`. When an action ends the hand, the hand is settled onto the table at once ([Rules](rules.md#between-hands)).

Any other `type` is rejected with `Unknown action`.

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
