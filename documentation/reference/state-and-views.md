# State and views

What a table stores, and what each audience is shown of it.

## The stored state

A [`Table`](../../src/table/Table.ts) is plain JSON. It holds everything, including every player's hole cards, so it's never sent to players as it is.

| Field        | Contents                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `options`    | The [table options](table-options.md)                                                          |
| `spectators` | People at the table without a seat: `{ playerId, name }`                                       |
| `seats`      | One entry per seat, the seat number being the index plus one: a seated player, or `null`       |
| `button`     | Index into `seats` of the last hand's button; `null` before the first hand                     |
| `hand`       | The [hand](../../src/hand/Hand.ts) being played, or the last one; `null` before the first hand |

A seated player has `playerId`, `name`, `stack`, `sittingOut` (on a break), `newPlayer` (waiting to be dealt in by the table's rule) and `leaving` (leaves when the hand is over). During a hand, a dealt-in player's `stack` is what they started the hand with; their chips are in the hand's betting until it's settled.

A hand has the betting ([`BettingRound`](../../src/betting/BettingRound.ts)), every dealt-in seat's `holeCards`, the `board`, the `bettingRound` (`preFlop`, `flop`, `turn` or `river`), and `result` once it's over. No deck is stored: cards are drawn when they're dealt ([0004](../explanation/decisions/0004-cards-as-strings-drawn-when-dealt.md)).

## Audiences

| Audience       | Who                                                                 |
| -------------- | ------------------------------------------------------------------- |
| A player ID    | That seated player, on a break or not, folded or not                |
| `"spectators"` | Everyone else: spectators, and players who have left (`SPECTATORS`) |

[`audienceOf(table, playerId)`](../../src/views/audiences.ts) gives a person's audience. People change audience only when they sit down or leave.

## Views

[`viewTable(table, audience)`](../../src/views/viewTable.ts) returns a [`TableView`](../../src/views/TableView.ts). It depends only on the table and the audience: no clock, no randomness. An audience that isn't a seated player's ID gets the spectators' view.

| Field        | Contents                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| `options`    | The table options                                                                                       |
| `seats`      | Per seat: `seat` (number), `playerId`, `name`, `stack`, `sittingOut`, `newPlayer`, `leaving`; or `null` |
| `spectators` | Everyone watching, with their names                                                                     |
| `hand`       | The hand being played, or the last one; `null` before the first hand                                    |
| `you`        | For a seated player: `playerId`, `seat`, and `buttons`; `null` for spectators                           |

A seat's `stack` is what the player has outside the middle: during a hand, what they have left in it.

### The hand

| Field          | Contents                                                                                |
| -------------- | --------------------------------------------------------------------------------------- |
| `bettingRound` | `preFlop`, `flop`, `turn` or `river`                                                    |
| `board`        | The board cards dealt so far                                                            |
| `pots`         | The pots collected from earlier betting rounds: `{ amount, seats }`, the main pot first |
| `players`      | Per player dealt in: `seat`, `bet` (in front of them), `folded`, `allIn`, and `cards`   |
| `button`       | The button's seat number                                                                |
| `toAct`        | The seat number of the player to act, or `null`                                         |
| `currentBet`   | The bet to match in this betting round                                                  |
| `result`       | `null` while the hand is played; then the hands shown and who won what, per pot         |

### Hole cards

A player's `cards` are shown to:

- **the player themselves,** from the deal to the end of the hand, also after folding;
- **everyone,** once they're shown at showdown ([0005](../explanation/decisions/0005-every-hand-at-showdown-is-shown.md)).

Otherwise they're `null`. A hand won because everyone else folded shows no cards.

### Buttons

`you.buttons` lists the [buttons](actions.md#buttons-to-show) the viewer may click, when it's their turn in a running hand; otherwise it's empty. Every listed button is one the rules accept.
