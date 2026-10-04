# Table options

What a host chooses when it creates a table with [`newTable(options)`](../../src/table/newTable.ts). An option left out, or given as `undefined`, has its default.

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
}
```

| Option                   | Meaning                                                                                                                                                                                                                                                                                          | Must be                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `blinds`                 | The small and big blind. The big blind is also the smallest bet                                                                                                                                                                                                                                  | Positive whole chips; `small` no bigger than `big`                       |
| `buyIn`                  | The chips a player may sit down with, `min` and `max` included                                                                                                                                                                                                                                   | Positive whole chips; `min` at least the big blind, `max` at least `min` |
| `seats`                  | The number of seats                                                                                                                                                                                                                                                                              | A whole number from 2 to 10                                              |
| `newPlayers`             | How a player who sits down while a game is running is dealt in ([0006](../explanation/decisions/0006-new-players-by-table-option.md))                                                                                                                                                            | One of the three below                                                   |
| `nextHandDelay`          | Milliseconds from the moment a hand can start until it does, by the `nextHand` [timer](timers.md); `null` leaves starting hands to the host ([0013](../explanation/decisions/0013-hands-start-by-themselves.md))                                                                                 | `null`, or whole milliseconds from 0 to 2,147,483,647                    |
| `turnTimeout`            | Milliseconds a player has to act before they fold, by the `turn` [timer](timers.md); `null` for no limit ([0014](../explanation/decisions/0014-a-turn-that-runs-out-folds.md))                                                                                                                   | `null`, or whole milliseconds from 1 to 2,147,483,647                    |
| `runoutDelay`            | Milliseconds between the betting rounds' cards of an all-in runout, by the `runout` [timer](timers.md); `null` deals the rest of the board at once ([0015](../explanation/decisions/0015-all-in-hands-are-tabled.md))                                                                            | `null`, or whole milliseconds from 0 to 2,147,483,647                    |
| `spectatorsSeeHoleCards` | Spectators see every hole card during the hand. Players never see others' before they're tabled or shown. Anyone in the spectators' audience could pass them on to a player, so turn it on only where that's acceptable ([0016](../explanation/decisions/0016-spectators-may-see-hole-cards.md)) | `true` or `false`                                                        |

## `newPlayers`

A game is running when at least two seated players, not on a break, are in it. At a table that's starting, everyone who sits down is dealt in from the next hand, whatever the option.

| Value               | A new player…                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"nextHand"`        | is dealt in from the next hand, without posting anything                                                                                                                    |
| `"waitForBigBlind"` | sits out until their seat would be the big blind, and is dealt in as the big blind; at most one per hand                                                                    |
| `"postBigBlind"`    | posts a big blind in their first hand, wherever they sit, as a live bet. In the small blind's seat, they wait a hand; in the big blind's seat, they post just the big blind |

## Errors

`newTable` throws an `Error` naming every problem, for example:

```
Invalid table options: the small blind can't be bigger than the big blind; a table has 2 to 10 seats
```
