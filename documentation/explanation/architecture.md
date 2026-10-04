# Architecture

poker-game is the rules of no-limit Texas Hold'em, written as plain functions of plain data, with a thin layer that makes them a [Remote State](../../../remote-state/docs/README.md) game.

## Layers

Each layer uses only the ones above it:

| Layer            | Folder                      | What it knows                                                                                                                         |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Betting and pots | `src/betting/`, `src/pots/` | Chips and seats in order: blinds, who acts, what may be bet, collecting the bets, side pots, splitting pots by ranks given as numbers |
| Buttons          | `src/ui/`                   | Translating what players click into the betting rules' actions                                                                        |
| The hand         | `src/hand/`                 | Cards: dealing, the four betting rounds, showdown ranked with poker-hands                                                             |
| The table        | `src/table/`                | People: seats, buy-ins, breaks, new players, the button between hands                                                                 |
| Views            | `src/views/`                | What each audience may see                                                                                                            |
| The plugin       | `src/plugin/`               | Remote State: joining, who may send which action, audiences, the view filter                                                          |

Betting and pots go together: a betting round collects its bets into the pots when it ends.

Betting knows nothing about cards, so the hardest rules, short all-ins and side pots, are tested with chips and made-up ranks alone. The hand adds cards, the table adds people, and only the plugin knows Remote State. That's also why the plugin has its own entry point: clients import the rules and views without loading Remote State's server.

## Plain functions of plain data

Every rule takes a state and returns a new one, and the states are JSON: what Remote State stores, diffs and sends. A rule that refuses an action returns the reason, which the plugin passes on to the player unchanged. Queries tell what's allowed, such as the buttons for the player to act, so clients don't need the rules to show them.

Small files, each with one rule or query and a comment saying what it's for, keep the rules readable one at a time.

## The life of an action

A player clicks "raise to 300":

1. **The client sends** `{ type: "raise", to: 300 }` to Remote State.
2. **`validateAction`** checks it's from a player, then the table: is it this player's turn in a running hand? The button is translated into the betting rules' action, a bet to 300, and the betting rules check the amount.
3. **`executeAction`** applies it. If it ends a betting round, the next cards are drawn; if it ends the hand, the pots are awarded and the hand settled onto the table: stacks back to the seats, busted and leaving players to the spectators.
4. **Audiences** follow the seats: comparing who's seated before and after gives Remote State the audience changes.
5. **The view filter** gives each audience its `TableView`; Remote State sends each one its update.

## Hidden information

The stored table holds every player's hole cards. They reach a player only through the view filter, which shows a player their own cards and everyone the hands shown at showdown. No deck is stored: each card is drawn when it's dealt, so the database gives no future cards away ([0004](decisions/0004-cards-as-strings-drawn-when-dealt.md)).

## Randomness and time

Drawing is a function passed to the plugin, so tests deal known cards. The view filter uses no clock and no randomness, as Remote State requires; it runs once per audience on every action. Starting hands is the host's for now, through `act` ([0012](decisions/0012-host-controls-the-table.md)); timers will take it over.
