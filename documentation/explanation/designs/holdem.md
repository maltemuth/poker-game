# Texas Hold'em

Status: Open

## Problem

`poker-game` should run no-limit Texas Hold'em tables for people playing in their browsers. Today it's an uncompiled sketch of a table state and a `play` function. It has no dealing, betting rules, showdown or tests, and no server.

[Remote State](../../../../remote-state/docs/README.md) now provides what a turn-based game with hidden information needs around its rules:

- hosts that create games and admit people;
- views per audience;
- a recorded history;
- since 0.6.0, timers and system actions, including the host's `act` ([0040](../../../../remote-state/docs/explanation/decisions/0040-server-initiated-actions.md), [0041](../../../../remote-state/docs/explanation/decisions/0041-named-timers.md)).

This proposal describes Hold'em as a Remote State `GamePlugin`, and the choices that have to be made first.

### Scope of the first version

- **In scope:** cash tables, 2 to 10 seats, fixed small and big blinds, buy-ins within a range, spectators, a turn timeout, and a short pause between hands.
- **Out of scope for now:** antes, straddles, rake, tournaments with rising blinds, run-it-twice, chat, and [Tri-Coin](tri-coin.md). The model shouldn't rule any of them out.

### Order

The core of the game is bet handling: which bets are acceptable, how the blinds are posted, and how all-ins and split pots are settled. It's built first, as plain functions with unit tests, without Remote State. Cards, the table, the plugin and timers follow, in that order ([The betting core](#the-betting-core)).

## Constraints

From Remote State:

- **States are JSON.** States are normalized through `JSON.stringify` before they're stored. Cards, seats and pots must be plain data: no `Map`s, `Set`s or class instances.
- **`executeAction` returns a new state.** The sketch's `play` mutates the table, for example `player.folded = true`.
- **Views must be deterministic.** `filterStateForAudience` can't use clocks or randomness, and runs once per audience on every transition, so it must be cheap. Shuffling belongs in `executeAction`, whose result is stored.
- **The library supplies the player.** The acting player is the `playerId` the library authenticated, never an ID inside the action. The sketch's `action.player.id` goes away.
- **A full snapshot is stored per action** ([Known limitations](../../../../remote-state/docs/explanation/limitations.md)). A hand history that grows inside the state makes storage grow quadratically.
- **Actions of one table run one at a time**, in one process. Expensive calculations, such as exact odds, hold up the table.
- **Players can't leave a Remote State game,** and there are no connect or disconnect events ([Game lifecycle](../../../../remote-state/docs/explanation/designs/game-lifecycle.md), open). Sitting out, standing up and leaving must be game actions, and absent players are handled by timeouts.
- **Timers run as the player `SYSTEM`** and pass through `validateAction`, so a stale timer is rejected. Timers are kept in memory for now: a restart drops them, and they don't come back ([0042](../../../../remote-state/docs/explanation/decisions/0042-timer-restarts-open.md)).
- **Hosts can't list games.** The host API has `createGame`, `admit` and `act`, but no way to find a server's open games. A host that must reach its tables after a restart has to keep their IDs itself.
- **Requirements:** Remote State is ESM and needs Node.js 24, and poker-hands is ESM since 0.12. Remote State isn't on npm yet, and poker-hands is there only at 0.3.1.

From the game:

- **Nobody sees cards they shouldn't:** not other players, not spectators, not in any view of a past state.
- **Chips are conserved.** Stacks plus everything in pots always add up to what was bought in.
- **The rules must be testable without a server,** with a known deck.

## How it maps onto Remote State

| Remote State                          | Hold'em                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| Initial state passed to `createGame`  | An empty table with its options: blinds, buy-in range, number of seats, time limits          |
| `admit` and `onJoin`                  | Everyone joins as a spectator, with the name the host passed                                 |
| `validateAction`                      | Is it this player's turn, is the action allowed, and is the amount legal?                    |
| `executeAction`                       | Apply the action. If a betting round closes, deal the next cards or settle the hand          |
| `filterStateForAudience`              | A seated player sees their own hole cards; spectators see none; shown hands are public       |
| `transition(…, { schedule, cancel })` | The `turn` timer after every action that leaves someone to act; `nextHand` after a hand ends |
| `SYSTEM` and the host's `act`         | Timeouts, starting the next hand, and the host pausing or closing the table                  |
| The recorded history                  | The hand history: every action, in order, with its author                                    |

## Options

### The betting core

The rules are plain functions of plain data, and know nothing about Remote State. They're built in layers, each tested on its own before the next one uses it:

1. **Betting.** Chips and seats only, no cards:
   - posting the blinds;
   - which actions and amounts the player to act may choose;
   - applying an action;
   - when a betting round is over, and who acts next;
   - the main pot and side pots;
   - splitting each pot among its winners.
2. **The hand.** Dealing, the four betting rounds, and showdown, ranked with poker-hands.
3. **The table.** Seats, buy-ins, the button moving from hand to hand, breaks.
4. **The plugin.** Validation, views, audiences and, last, timers, as a thin layer over the rules.

Betting doesn't know about cards. Splitting a pot takes the players' hand ranks, as numbers, so all-ins and split pots can be tested with ranks made up for the test, such as "seats 1 and 3 tie, seat 2 is worse". The hand layer computes the real ranks with poker-hands.

The functions take a state and return a new one. A rule that rejects returns the reason, and a query tells what is allowed, such as "seat 3 may fold, call 40, or raise to between 80 and 500". The plugin later passes the same reasons on as `validateAction`'s strings.

The code is kept in small files, one rule or query each. Every file starts with a comment that says what it's for, so the rules can be read file by file.

This is how Remote State's tic-tac-toe example is split. It keeps the betting rules testable with plain objects, and lets Tri-Coin reuse the dealing, seating and showdown parts. Rules written inside the plugin functions would be harder to test and to share with a variant.

### Representing cards

Decided in [0004](../decisions/0004-cards-as-strings-drawn-when-dealt.md): cards are strings such as `"Ah"`, and each card is drawn when it's dealt, from the cards still out, by a function the host passes in. No deck is stored, so stored states hold only cards that were dealt.

### Pots

Decided in [0003](../decisions/0003-pots-stored-at-round-end.md): bets stay in front of the players during a round. When it's over, the uncalled bet goes back, and the pots are computed from every seat's total for the hand and stored.

### The betting actions

Decided in [0002](../decisions/0002-fold-or-bet-to.md): the rules take `fold`, or `bet` with the total to bet to in this betting round. The buttons a player clicks, `fold`, `check`, `call`, `raise` with `to` and `allIn`, are translated into those two.

### Audiences

The plugin reference's example moves a folded player into `spectators`. That doesn't fit poker:

- a player who folded should still see their own cards;
- they're dealt in again a minute later;
- moving them every hand would redo views across audiences on every fold.

- **A. Every person keeps their own audience** (the default, their player ID). The filter decides per person what they may see. That's one view per person per transition.
- **B. Seated players keep their own audience; everyone who isn't seated is in `spectators`.** People move only when they sit down or stand up. Spectators all get one shared view, so a table with many spectators costs one view for all of them.

Recommended: B. `onJoin` puts every new person in `spectators`. `sitDown` moves them to their own audience (`null`), and `leave` moves them back.

### Showdown

Decided in [0005](../decisions/0005-every-hand-at-showdown-is-shown.md): every hand still in at showdown is shown, ranked with poker-hands; mucking may come later. Exact odds aren't part of the rules: a client can show them for the cards it may see, with `@malte.muth/poker-hands-wasm`.

### Time limits

Two named timers:

- **`turn`,** for the player to act. It's scheduled after every action that leaves someone to act, so each move replaces it. Its action is `{ type: "timeout", turn }`, where `turn` counts the actions in the hand, like tic-tac-toe's `moves`. A timeout from an earlier turn is rejected.
  - On a timeout, the player checks if they can, and folds otherwise.
  - After two timeouts in a row, they're also sat out, so an absent player doesn't hold up every hand.
  - The state keeps the turn's deadline, so clients can show a countdown. Remote State's [how-to](../../../../remote-state/docs/how-to/schedule-actions.md) keeps only the limit in the state, and its timers run on the server only. But `executeAction` may read the clock: its result is stored, and the filter just passes the deadline on.
- **`nextHand`,** a few seconds after a hand is settled, so everyone can see the result. Its action starts the next hand if at least two seated players are in, and otherwise leaves the table waiting. When the second player sits down, `sitDown` starts a hand at once, or schedules `nextHand`.

Dealing the flop, turn and river needs no timer: the action that closes a betting round deals the next cards. When everyone left is all-in, the remaining cards can either be dealt at once (**A**) or with a `runout` timer, one betting round's cards every second or two (**B**). B is better to watch, but adds a third timer. Recommended: A first.

Restarts drop timers ([0042](../../../../remote-state/docs/explanation/decisions/0042-timer-restarts-open.md)). Remote State's answer, that a game waits until a player acts, doesn't help a poker table:

- **During a hand,** only the player to act can move. If they've gone, nobody else can unblock the table.
- **Between hands,** the lost `nextHand` timer was the only thing that would start the next hand.

- **A. The host acts after a restart.** For every open table, the host calls `act(gameId, { type: "resume" })`. The action schedules the timers the state calls for again, with their full duration. The host created its tables, but it has to store their IDs to find them again, since Remote State can't list them.
- **B. A player claims a timeout.** Any seated player may send `timeout` once the stored deadline has passed. That works without the host, but `validateAction` then depends on the clock.

Recommended: A. For poker, starting a turn over with its full time after a restart is right, which is one data point for Remote State's open restart question.

### Who controls the table

The sketch has `START`, `PAUSE` and `UNPAUSE` actions. In Remote State, roles belong to the game state ([0022](../../../../remote-state/docs/explanation/decisions/0022-roles-belong-to-game-state.md)), and the host can act as the system.

- **A. Only the host:** pausing, resuming and closing a table are system actions the host runs through `act`, for example from an admin page.
- **B. An owner in the state:** the person who created the table may pause and close it from the client.

Recommended: A first. Hands start by themselves once two players sit, so no one needs to press start.

## Open questions

- **Joining a running table:** decided in [0006](../decisions/0006-new-players-by-table-option.md): a table option, dealt in next hand by default.
- **The button when players leave:** decided in [0007](../decisions/0007-moving-button.md): a moving button, skipping empty seats.
- **Busting:** decided in [0008](../decisions/0008-busted-players-become-spectators.md): they become spectators.
- **Leaving with chips:** does a player who stands up and sits down again have to bring at least what they left with, against "ratholing"?
- **Hiding a person's name** from other players, and whether spectators may see who is watching.
- **Hand history in the client:** should the state keep the last hand's actions and result for the client to show, or should clients read them from `GET …/updates`? Keeping only the last hand bounds the state's size.
- **Distribution:** while neither library is on npm, `poker-game` depends on them by local path, `file:../remote-state/packages/remote-state` and `file:../poker-hands/packages/library`. Should the three repositories become workspaces of one folder instead?
