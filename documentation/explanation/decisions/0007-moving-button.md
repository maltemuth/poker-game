# 0007. The button moves to the next player dealt in

Status: Accepted
Date: 2026-10-04

## Context

Between hands, the button moves one seat clockwise. When players leave, sit out or wait, it can either skip to the next player who's dealt in (a moving button), or move by seat and sometimes rest on an empty seat, so that the blinds move fairly (a dead button) ([Texas Hold'em design](../designs/holdem.md#open-questions)).

## Decision

- **The button moves to the next player dealt in,** clockwise from the last hand's button, skipping empty seats and players who sit out or wait.
- **For the first hand,** it starts at the first player dealt in, in seat order.
- **The blinds follow from the button,** as for any hand ([Rules](../../reference/rules.md#blinds)).

## Alternatives considered

- **A dead button.** Fairer: no one pays the big blind twice in a row or skips it when a player leaves. But it needs the missed blinds of every seat, and dead small blinds, and it's harder to follow.

## Consequences

- When a player leaves, someone may pay the big blind twice in a row, or skip a blind.
- Only the last hand's button seat is stored with the table.
