# 0003. Pots are stored at the end of each betting round, computed from the hand's totals

Status: Accepted
Date: 2026-10-04

## Context

With all-ins, a hand has a main pot and side pots, each with the players who can win it. The pots could be stored and updated with every bet, derived from what each seat put into the hand whenever they're needed, or something in between ([Texas Hold'em design](../designs/holdem.md#pots)). The betting already tracks each seat's bet on the street and its total for the hand (`committed`).

## Decision

- **Bets stay in front of the players during a betting round,** as each seat's `bet`. The stored pots don't change while a round is played.
- **When a round is over, the bets are collected:** the uncalled part of the last bet goes back to its player, the pots are computed again from every seat's total for the hand, and the result is stored with the round. This happens before each new street and at the end of the hand, whether it ends at showdown or because everyone else folded.
- **Pots are always computed from the hand's totals,** never updated piece by piece. Collecting twice gives the same pots.
- **A pot is its amount and the seats that can win it:** the seats still in the hand that put in at least the pot's level.

## Alternatives considered

- **Updating stored pots with every bet.** Every bet, call and all-in would have to find the right side pot, split one when a shorter all-in comes in, and merge streets. Side-pot bugs live there.
- **Deriving the pots whenever they're needed, storing none.** No copy that could be stale, but the state and its history don't show the pots, every reader computes them, and there's no single point where uncalled bets go back.

## Consequences

- The state, and so the recorded history, shows the pots after every street, and clients render them without computing anything.
- The rules must collect the bets at every round end. Starting the next street and awarding the pots do it themselves, so they can't be forgotten.
- The chips are conserved at every step: stacks, plus bets in front of the players, plus the pots.
- Tri-Coin's pots per currency fit the same shape.
