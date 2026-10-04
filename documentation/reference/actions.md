# Actions

What players send to act, and what they're translated into ([0002](../explanation/decisions/0002-fold-or-bet-to.md)). So far, only betting actions exist; seating actions follow with the table.

## Buttons

Clients send the button a player clicked, a `UiAction`:

```ts
type UiAction =
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  | { type: "raise"; to: number } // total on this street; also a first bet
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
type BettingAction = { type: "fold" } | { type: "bet"; to: number }; // the player's total bet on this street
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

| Option  | Listed             | Fields                                                                                        |
| ------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `fold`  | Always             |                                                                                               |
| `check` | Nothing is owed    |                                                                                               |
| `call`  | Something is owed  | `amount`: the chips the call adds. `allIn`: the call takes everything the player has          |
| `raise` | Raising is allowed | `min`, `max`: totals on this street. `firstBet`: no one has bet on the street; label it "bet" |
| `allIn` | Raising is allowed | `to`: everything the player has, as a total                                                   |

When the player can't cover the call, there's no `allIn` option: the `call` is the all-in, with `allIn: true`.

Every listed option translates into an action `checkAction` accepts; for `raise`, any total from `min` to `max`.
