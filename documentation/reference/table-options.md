# Table options

What a host chooses when it creates a table with [`newTable(options)`](../../src/table/newTable.ts).

```ts
interface TableOptions {
  blinds: { small: number; big: number };
  buyIn: { min: number; max: number };
  seats: number;
  newPlayers?: "nextHand" | "waitForBigBlind" | "postBigBlind"; // default "nextHand"
}
```

| Option       | Meaning                                                                                                                               | Must be                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `blinds`     | The small and big blind. The big blind is also the smallest bet                                                                       | Positive whole chips; `small` no bigger than `big`                       |
| `buyIn`      | The chips a player may sit down with, `min` and `max` included                                                                        | Positive whole chips; `min` at least the big blind, `max` at least `min` |
| `seats`      | The number of seats                                                                                                                   | A whole number from 2 to 10                                              |
| `newPlayers` | How a player who sits down while a game is running is dealt in ([0006](../explanation/decisions/0006-new-players-by-table-option.md)) | One of the three below                                                   |

## `newPlayers`

A game is running when at least two seated players, not sitting out, are in it. At a table that's starting, everyone who sits down is dealt in from the next hand, whatever the option.

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
