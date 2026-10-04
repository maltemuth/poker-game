# 0002. The rules take a fold or a total to bet to; buttons are translated

Status: Accepted
Date: 2026-10-04

## Context

A player who acts has to say what they do, and how much. Players think in buttons: fold, check, call, bet, raise, all-in. Which ones apply, and what they mean in chips, depends on the state: "call" is 40 chips for one player and all-in for another, and the same click is a "bet" on one street and a "raise" on another. The sketch had a `RAISE` action with a `betAmount`, without saying whether that's the chips added or the new total ([Texas Hold'em design](../designs/holdem.md#the-betting-actions)).

## Decision

- **The rules know two actions:**
  - `{ type: "fold" }`;
  - `{ type: "bet", to }`, which makes the player's bet on this street `to` chips, whatever they had in before.

  Every other move is a `bet` with the right total. A check is a bet to what the player already has in, a call is a bet to the current bet, or everything they have if that's less, and all-in is a bet to everything.

- **What may be bet is a set of totals:**
  - what the player already has in, if nothing is owed (check);
  - the current bet, capped at what the player has (call);
  - from the minimum raise to everything, when raising is allowed. A player who can't make the minimum raise may still raise all-in for less.

  Going all-in is therefore a call or the top of the raise range. It isn't always allowed: a player who faces a short all-in that doesn't reopen the betting may only call or fold.

- **Buttons are UI actions, translated into rule actions:** `fold`, `check`, `call`, `raise` with `to`, and `allIn`. A first bet on a street is a `raise` too; the client may label it "bet". The translation fails with a reason when a button doesn't apply, for example "check" while facing a bet. A query gives the buttons that apply, with their amounts, so the client can show them.
- **Amounts are whole chips.**

## Alternatives considered

- **The buttons as the rules' actions.** The rules would check five actions with overlapping meanings: a call for everything and an all-in are the same move. The minimum raise and the all-in exceptions would be spread over several actions.
- **Amounts added instead of totals.** "Raise by 200" is sometimes how a raise is said, but checking a minimum raise then needs the player's earlier bet on the street, and the history shows increments instead of totals.

## Consequences

- The betting rules check one number against one set of totals, so the special cases are in one place: the minimum raise, short all-ins, and raises that don't reopen the betting.
- The translation is the only place that knows the buttons. A client with other buttons, such as "raise by" or "pot", needs only a new translation.
- Rejections come from two places. The translation explains buttons ("there's 100 to call"), and the rules explain amounts ("a raise must be to at least 200").
