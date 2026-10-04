# 0009. Standing up folds

Status: Accepted; the action that becomes a spectator is `leave` since [0010](0010-standing-up-is-a-break.md)
Date: 2026-10-04

## Context

A player can stand up while they're in a hand. If they kept their cards until the hand is over, they'd still have to act when it's their turn, though they've left; the table would wait for them, or for a timeout.

## Decision

- **Standing up during a hand folds the player's hand at once,** whether it's their turn or not. Their chips in the pots stay there.
- **They become a spectator when the hand is over,** with the chips they didn't bet. Until then, their seat is still part of the hand, so no one can sit in it.
- **If the fold ends the betting round or the hand,** it moves on as after any fold: the next cards are dealt, or the hand is settled.

## Alternatives considered

- **Playing the hand out before standing up.** The player could still win, but a player who has left holds up the table.

## Consequences

- The betting rules can fold a seat out of turn; the player to act stays the same unless the fold leaves no one to bet against.
- Standing up needs the dealing function, since a fold can bring the next cards.
