# Rules as implemented

The no-limit Texas Hold'em rules poker-game applies, as built so far: the blinds, the betting, dealing, the pots, showdown, and the table between hands. The code is in [`src/betting/`](../../src/betting/), [`src/pots/`](../../src/pots/) and [`src/hand/`](../../src/hand/). Seats, buy-ins and what happens between hands are in [`src/table/`](../../src/table/).

Amounts are whole chips. "Bet" below means the chips a player has bet in the current betting round, and "the bet to match" is the highest bet in it.

## Blinds

| Players   | Small blind                     | Big blind                           | First to act before the flop      |
| --------- | ------------------------------- | ----------------------------------- | --------------------------------- |
| 2         | The button                      | The other player                    | The button                        |
| 3 or more | First player left of the button | Next player left of the small blind | Next player left of the big blind |

- **A player who can't cover a blind** posts what they have and is all-in.
- **The bet to match is the full big blind,** even if the big blind posted less.
- **Posting a blind isn't acting.** The big blind gets to act even when everyone just called: it may check or raise.
- **A new player may post an extra big blind,** when the table's `newPlayers` option is `postBigBlind` ([Table options](table-options.md#newplayers)). It's a live bet, like the big blind: they may check or raise when the betting comes back to them unraised.
- **A hand needs at least two players,** each with chips. `postBlinds` throws otherwise; the table only deals in players who can play.

## Order of play

- **Play goes clockwise,** skipping players who have folded or are all-in.
- **After the flop,** the first player left of the button who can act starts. Heads-up, that's the big blind.
- **A player must act** if they owe chips to the bet to match, or if they haven't acted in this betting round and someone else could still bet against them.
- **The betting round is over** when no player must act:
  - everyone still in has acted and matched the bet, or is all-in;
  - or only one player is left in the hand.
- **When at most one player can still act** and has matched what the others bet, no one acts, and the rest of the board is dealt without betting.

## Dealing

Cards are strings, a value (`2`–`9`, `T`, `J`, `Q`, `K`, `A`) and a suit (`h`, `d`, `c`, `s`), such as `"Ah"`. Each card is drawn when it's dealt, from the cards no one holds and the board doesn't show ([0004](../explanation/decisions/0004-cards-as-strings-drawn-when-dealt.md)). No cards are burned.

| Betting round | Cards dealt before it                                                                  |
| ------------- | -------------------------------------------------------------------------------------- |
| Pre-flop      | Two hole cards each, one at a time, clockwise from the first player left of the button |
| Flop          | Three board cards                                                                      |
| Turn          | One board card                                                                         |
| River         | One board card                                                                         |

- **The next cards are dealt as soon as a betting round is over,** by the action that ends it.
- **A betting round in which no one can act is passed straight through:** when everyone left is all-in, the rest of the board is dealt at once.
- **The hand ends early** when only one player is left in it; no more cards are dealt.

## What a player may do

The player to act may always fold. Otherwise they bet to a total ([0002](../explanation/decisions/0002-fold-or-bet-to.md)):

| Total                                   | Meaning                                            | When                                       |
| --------------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| What they already have in               | Check                                              | Nothing is owed                            |
| The bet to match, or everything if less | Call; for everything, an all-in call               | Something is owed                          |
| From the minimum raise to everything    | Raise; in an unopened betting round, the first bet | Raising is allowed (below)                 |
| Everything, if below the minimum raise  | All-in raise for less                              | Raising is allowed, and the stack is short |

### The minimum raise

- **The first bet in a betting round** is at least the big blind.
- **A raise** must add at least the last full raise in the betting round to the bet to match. Before any raise, that's the big blind.
- **A raise that adds at least that much is a full raise.** It sets the minimum for the next raise. An all-in that adds less leaves the minimum as it was.

Example, blinds 50/100: a raise to 300 adds 200, so the next raise must be to at least 500.

### When raising is allowed

All three must hold:

1. **The player has more than the call.**
2. **Someone else can still act.** Against players who are all all-in, there's no one to raise.
3. **The betting is open to the player.** Either they haven't acted in this betting round, or the bet to match has gone up by at least a full raise since they last acted.

So an all-in that adds less than a full raise doesn't reopen the betting for players who have already acted: they may only call or fold. Several such all-ins reopen it once together they add up to a full raise.

Example, blinds 50/100, minimum raise 100: A bets 100. B is all-in for 150 total, C all-in for 200, and D calls 200. A has acted at 100 and now faces 200, an increase of 100, a full raise: A may raise again. Had only B gone all-in, A could only call 150 or fold.

### Matching all-in players

When no one else in the hand can act, the last player only has to match what the others actually bet. If a short big blind is all-in for less than the small blind has in, the small blind has nothing to call.

## Pots

Pots are collected when a betting round is over, before the next betting round and at the end of the hand ([0003](../explanation/decisions/0003-pots-stored-at-round-end.md)). During a round, the stored pots show what was collected before it, and each player's bet in the betting round is in front of them.

### The uncalled bet

When the bets are collected, the player who put the most into the hand gets back what they put in above the next highest total, folded players included. That's the part of a bet no one called:

- **Everyone folds to a bet:** blinds 50/100, a raise to 300, both blinds fold. 200 goes back; the raiser wins the pot of 250.
- **A call all-in for less:** a bet of 800, called all-in for 350. 450 goes back.

### Main pot and side pots

The pots are computed from every player's total for the hand, the main pot first:

1. Each different total among the players still in the hand is a level, lowest first.
2. A pot holds what every player put in between the level below and its level. The last pot also holds whatever a folded player put in above the highest level.
3. A pot can be won by the players still in the hand who put in at least its level.

Folded players' chips stay in the pots, but they can't win them.

Example: A is all-in for 200 in total, B for 500, C and D put in 800 each, and E folded after putting in 100.

| Pot        | Amount              | Can be won by |
| ---------- | ------------------- | ------------- |
| Main pot   | 4 × 200 + 100 = 900 | A, B, C, D    |
| Side pot 1 | 3 × 300 = 900       | B, C, D       |
| Side pot 2 | 2 × 300 = 600       | C, D          |

### Awarding the pots

At the end of the hand, each pot goes to the best hand among the players who can win it:

- **One player left:** everyone else folded, so they win every pot without showing.
- **A tie:** the pot is shared evenly.
- **Odd chips:** chips left over when a pot can't be shared evenly go one each to the tied winners, starting with the first left of the button and going clockwise.

Each pot is decided on its own: in the example, A can have the best hand and win the main pot while C and D tie for both side pots.

## Showdown

The hand goes to showdown when the betting on the river is over with at least two players still in ([0005](../explanation/decisions/0005-every-hand-at-showdown-is-shown.md)).

- **Every player still in shows,** at the same time: their hole cards, their best five cards from the hole cards and the board, and the hand type, from `highCard` to `royalFlush`.
- **Hands are ranked with poker-hands.** Equal hands rank the same, whatever their suits, so a board that plays splits the pot.
- **Each pot goes to the best hand among the players who can win it** ([Awarding the pots](#awarding-the-pots)).
- **A hand won because everyone else folded isn't shown.**

## Between hands

### The end of a hand

When a hand is over, every player dealt in gets their stack from it, winnings included. Then:

- **Players without chips become spectators** ([0008](../explanation/decisions/0008-busted-players-become-spectators.md)). To play again, they sit down with a new buy-in.
- **Players who stood up during the hand become spectators,** with their chips. Players dealt in can stand up at any time, even after folding; their chips stay in the hand until it's over.

### Who is dealt in

The next hand is dealt to the players in the game: seated, not sitting out, and not new players still waiting. With fewer than two of them, the table is starting, and everyone seated and not sitting out is dealt in.

New players join by the table's `newPlayers` option ([Table options](table-options.md#newplayers)).

### The button

The button moves to the next seat clockwise whose player is in the game, skipping empty seats, players sitting out and new players still waiting ([0007](../explanation/decisions/0007-moving-button.md)). For the first hand, it's the first such seat in seat order. The blinds follow from the button, so when players leave, someone may pay the big blind twice in a row, or skip a blind.

## Rejections

[`checkAction`](../../src/betting/checkAction.ts) rejects an action with one of these reasons, checked in this order. A total above the call when raising isn't allowed gets the reason raising isn't allowed.

| Reason                                                                   | When                                               |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| `The betting round is over`                                              | No one is to act                                   |
| `Unknown action`                                                         | Neither a fold nor a bet                           |
| `A bet must be a whole number of chips`                                  | `to` is missing, or not an integer                 |
| `You must bet at least <call> to stay in`                                | The total is below the call                        |
| `You don't have enough chips to raise`                                   | A raise, with no more than the call                |
| `Everyone else is all-in`                                                | A raise, with no one left to act on it             |
| `The betting wasn't reopened by a full raise; you can only call or fold` | A raise, when the betting isn't open to the player |
| `A raise must be to at least <min>`                                      | A raise below the minimum                          |
| `You only have <max>`                                                    | A raise above everything the player has            |
