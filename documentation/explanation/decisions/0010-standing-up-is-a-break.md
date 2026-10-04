# 0010. Standing up is a break; leaving takes the chips

Status: Accepted
Date: 2026-10-04

## Context

A player who gets up from the table may mean to come back, leaving their chips at the seat, or to go, taking their chips with them. [0009](0009-standing-up-folds.md) made standing up fold a running hand and turn the player into a spectator with their chips. Separately, `sitOut` kept the seat and chips but let the player play out the current hand.

## Decision

- **`standUp` is a break.** It folds a running hand the player is still in, at once (as in 0009). The player keeps their seat and chips and isn't dealt in until they `sitIn` again.
- **`sitOut` is gone.** A break is the only way to sit out.
- **`leave` takes the chips.** It's what standing up was in 0009: it folds a running hand at once, and the player becomes a spectator with their chips when the hand is over.
- **How leaving works may change** when it's designed further, for example limits on sitting down again with fewer chips; for now it stays as built.

## Alternatives considered

- **Keeping `sitOut` next to the break,** to sit out from the next hand while playing the current one out. Two actions for nearly the same thing.

## Consequences

- The table actions are `sitDown`, `standUp`, `sitIn`, `leave`, and the betting buttons.
- A player on a break holds their seat for as long as they like; a limit would come with the timers.
