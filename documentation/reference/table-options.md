# Table options

What a host chooses when it creates a table with [`newTable(options)`](../../src/table/newTable.ts), and may change until the first hand ([below](#changing-the-options)). An option left out, or given as `undefined`, has its default.

```ts
interface TableOptions {
  blinds: { small: number; big: number };
  buyIn: { min: number; max: number };
  seats: number;
  newPlayers?: "nextHand" | "waitForBigBlind" | "postBigBlind"; // default "nextHand"
  nextHandDelay?: number | null; // milliseconds, default 5000
  turnTimeout?: number | null; // milliseconds, default 30000
  runoutDelay?: number | null; // milliseconds, default 2000
  spectatorsSeeHoleCards?: boolean; // default false
  blindProgression?: { everyHands: number; raisePercent: number } | null; // default null
}
```

| Option                   | Meaning                                                                                                                                                                                                                                                                                          | Must be                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `blinds`                 | The small and big blind. The big blind is also the smallest bet                                                                                                                                                                                                                                  | Positive whole chips; `small` no bigger than `big`                                              |
| `buyIn`                  | The chips a player may sit down with, `min` and `max` included                                                                                                                                                                                                                                   | Positive whole chips; `min` at least the big blind, `max` at least `min`                        |
| `seats`                  | The number of seats                                                                                                                                                                                                                                                                              | A whole number from 2 to 10                                                                     |
| `newPlayers`             | How a player who sits down while a game is running is dealt in ([0006](../explanation/decisions/0006-new-players-by-table-option.md))                                                                                                                                                            | One of the three below                                                                          |
| `nextHandDelay`          | Milliseconds from the moment a hand can start until it does, by the `nextHand` [timer](timers.md); `null` leaves starting hands to the host ([0013](../explanation/decisions/0013-hands-start-by-themselves.md))                                                                                 | `null`, or whole milliseconds from 0 to 2,147,483,647                                           |
| `turnTimeout`            | Milliseconds a player has to act before they fold, by the `turn` [timer](timers.md); `null` for no limit ([0014](../explanation/decisions/0014-a-turn-that-runs-out-folds.md))                                                                                                                   | `null`, or whole milliseconds from 1 to 2,147,483,647                                           |
| `runoutDelay`            | Milliseconds between the betting rounds' cards of an all-in runout, by the `runout` [timer](timers.md); `null` deals the rest of the board at once ([0015](../explanation/decisions/0015-all-in-hands-are-tabled.md))                                                                            | `null`, or whole milliseconds from 0 to 2,147,483,647                                           |
| `spectatorsSeeHoleCards` | Spectators see every hole card during the hand. Players never see others' before they're tabled or shown. Anyone in the spectators' audience could pass them on to a player, so turn it on only where that's acceptable ([0016](../explanation/decisions/0016-spectators-may-see-hole-cards.md)) | `true` or `false`                                                                               |
| `blindProgression`       | The blinds go up a level every `everyHands` hands, by `raisePercent` each; `null` keeps them as they are ([below](#blind-levels), [0022](../explanation/decisions/0022-blinds-go-up-by-hands.md))                                                                                                | `null`, or `everyHands` a whole number from 1 and `raisePercent` a whole number from 1 to 1,000 |

## `newPlayers`

A game is running when at least two seated players, not on a break, are in it. At a table that's starting, everyone who sits down is dealt in from the next hand, whatever the option.

| Value               | A new player…                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"nextHand"`        | is dealt in from the next hand, without posting anything                                                                                                                    |
| `"waitForBigBlind"` | sits out until their seat would be the big blind, and is dealt in as the big blind; at most one per hand                                                                    |
| `"postBigBlind"`    | posts a big blind in their first hand, wherever they sit, as a live bet. In the small blind's seat, they wait a hand; in the big blind's seat, they post just the big blind |

## Blind levels

With `blindProgression`, every `everyHands` hands is a level, and a hand is dealt at its level: hands 1 to `everyHands` at level 1, and so on. Level 1 is `blinds`. Each level after raises the big blind by `raisePercent` over level 1, compounded, rounded to the nearest of 1, 2, 3, 4, 5, 6 or 8 times a power of ten, and always above the level before; the small blind keeps the ratio of `blinds`.

| Level | 50/100, 50% | 50/100, 100% | 25/100, 100% |
| ----- | ----------- | ------------ | ------------ |
| 1     | 50/100      | 50/100       | 25/100       |
| 2     | 100/200     | 100/200      | 50/200       |
| 3     | 150/300     | 200/400      | 100/400      |
| 4     | 200/400     | 400/800      | 200/800      |
| 5     | 250/500     | 1,000/2,000  | 500/2,000    |

`blindsAtLevel(options, level)` gives a level's blinds, `levelOfHand(options, handNumber)` a hand's level, and `blindLevelOfHand(options, handNumber)` both with the next level, as the views carry it.

## Errors

`newTable` throws an `Error` naming every problem, for example:

```
Invalid table options: the small blind can't be bigger than the big blind; a table has 2 to 10 seats
```

`optionProblems(options)` returns the same problems as a list, empty when the options are valid, for checking options before sending them.

## Changing the options

Until the first hand is dealt, the host can change any option but `seats` with the system action `setOptions` ([Actions](actions.md#system-actions), [0020](../explanation/decisions/0020-options-change-until-the-first-hand.md)):

```ts
{ type: "setOptions", options: { blinds: { small: 100, big: 200 }, turnTimeout: null } }
```

- Options left out, or given as `undefined`, keep their values; keys that aren't options are ignored.
- The result is checked like a new table's options, and rejected with `Invalid table options: …` naming every problem.
- Chips already on the table stay as they are, also where the new buy-in range wouldn't allow them.
- A new `nextHandDelay` starts the `nextHand` [timer](timers.md) over with the new delay, or cancels it.
- Once a hand has been dealt, `setOptions` is rejected with `The options can't change once a hand has been dealt`.
