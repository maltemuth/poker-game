# Rules as implemented

The no-limit Texas Hold'em rules poker-game applies, as built so far: the blinds and the betting. The code is in [`src/betting/`](../../src/betting/). All-ins across pots, split pots and showdown follow with their milestones ([BACKLOG.md](../../BACKLOG.md)).

Amounts are whole chips. "Bet" below means a player's chips put in on the current street, and "the bet to match" is the highest bet on the street.

## Blinds

| Players   | Small blind                     | Big blind                           | First to act before the flop      |
| --------- | ------------------------------- | ----------------------------------- | --------------------------------- |
| 2         | The button                      | The other player                    | The button                        |
| 3 or more | First player left of the button | Next player left of the small blind | Next player left of the big blind |

- **A player who can't cover a blind** posts what they have and is all-in.
- **The bet to match is the full big blind,** even if the big blind posted less.
- **Posting a blind isn't acting.** The big blind gets to act even when everyone just called: it may check or raise.
- **A hand needs at least two players,** each with chips. `postBlinds` throws otherwise; the table only deals in players who can play.

## Order of play

- **Play goes clockwise,** skipping players who have folded or are all-in.
- **After the flop,** the first player left of the button who can act starts. Heads-up, that's the big blind.
- **A player must act** if they owe chips to the bet to match, or if they haven't acted on this street and someone else could still bet against them.
- **The betting round is over** when no player must act:
  - everyone still in has acted and matched the bet, or is all-in;
  - or only one player is left in the hand.
- **When at most one player can still act** and has matched what the others bet, no one acts, and the rest of the board is dealt without betting.

## What a player may do

The player to act may always fold. Otherwise they bet to a total ([0002](../explanation/decisions/0002-fold-or-bet-to.md)):

| Total                                   | Meaning                                     | When                                       |
| --------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| What they already have in               | Check                                       | Nothing is owed                            |
| The bet to match, or everything if less | Call; for everything, an all-in call        | Something is owed                          |
| From the minimum raise to everything    | Raise; on an unopened street, the first bet | Raising is allowed (below)                 |
| Everything, if below the minimum raise  | All-in raise for less                       | Raising is allowed, and the stack is short |

### The minimum raise

- **The first bet on a street** is at least the big blind.
- **A raise** must add at least the last full raise on the street to the bet to match. Before any raise, that's the big blind.
- **A raise that adds at least that much is a full raise.** It sets the minimum for the next raise. An all-in that adds less leaves the minimum as it was.

Example, blinds 50/100: a raise to 300 adds 200, so the next raise must be to at least 500.

### When raising is allowed

All three must hold:

1. **The player has more than the call.**
2. **Someone else can still act.** Against players who are all all-in, there's no one to raise.
3. **The betting is open to the player.** Either they haven't acted on this street, or the bet to match has gone up by at least a full raise since they last acted.

So an all-in that adds less than a full raise doesn't reopen the betting for players who have already acted: they may only call or fold. Several such all-ins reopen it once together they add up to a full raise.

Example, blinds 50/100, minimum raise 100: A bets 100. B is all-in for 150 total, C all-in for 200, and D calls 200. A has acted at 100 and now faces 200, an increase of 100, a full raise: A may raise again. Had only B gone all-in, A could only call 150 or fold.

### Matching all-in players

When no one else in the hand can act, the last player only has to match what the others actually bet. If a short big blind is all-in for less than the small blind has in, the small blind has nothing to call.

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
