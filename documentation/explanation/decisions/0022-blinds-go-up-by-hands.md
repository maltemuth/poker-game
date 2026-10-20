# 0022. Blinds can go up every so many hands, in generated levels

Status: Accepted
Date: 2026-10-20

## Context

At a poker night, blinds that go up keep the game moving and bring it to an end. A table's blinds were fixed. Rising blinds need answers to when they go up, how the levels are set, and what happens across pauses and restarts.

## Decision

- **A table option, `blindProgression`:** `{ everyHands, raisePercent }`, or null to keep the blinds as they are, the default.
- **Levels go up by hands:** every `everyHands` hands is one level. A hand is dealt at its level, so blinds never change during a hand.
- **The levels are generated:** level 1 is the table's blinds. Each level after raises the big blind by `raisePercent` over the first level, compounded, rounded to the nearest chip-friendly amount (1, 2, 3, 4, 5, 6 or 8 times a power of ten), and always above the level before. The small blind keeps the table's ratio to the big blind.
- **A hand's level follows from its number,** so it needs no state of its own, and it can be changed like any other option before the first hand ([0020](0020-options-change-until-the-first-hand.md)).
- **Views carry `blindLevel`:** the level of the hand being played, or of the next one, its blinds, and the next level's blinds and first hand.

## Alternatives considered

- **Levels by time.** A tournament clock, but it needs a clock that stops while the table is paused or interrupted, and the level's time to survive a restart. Counting hands needs neither: no hands are dealt while a table waits.
- **An explicit list of levels.** The most control, but tedious on a phone; generated levels need two numbers.
- **Rounding to multiples of the small blind.** Keeps amounts in the table's units, but makes odd-looking levels such as 150/300 after 100/200 at 50%.

## Consequences

- A table's blinds option is its first level's; the blinds of a hand are its betting round's `bigBlind` and posted amounts.
- Without a cap, the blinds keep going up; at some point a player's stack covers only a blind, and they're all-in from it.
- The buy-in is checked against the first level's big blind only.
