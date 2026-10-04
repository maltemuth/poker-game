# 0004. Cards are strings, drawn when they're dealt

Status: Accepted
Date: 2026-10-04

## Context

The hand needs cards: two for each player, then the flop, turn and river. The state is stored as JSON after every action, in full ([Texas Hold'em design](../designs/holdem.md#representing-cards)), and the view filter hides cards from players who mustn't see them. Whoever can read the database can read every stored state. Tests need to know which cards come.

## Decision

- **A card is a string,** a value and a suit as in poker-hands' notation: `"Ah"`, `"Td"`, `"2c"`. They're converted to poker-hands' card objects only to rank hands.
- **No deck is stored.** Each card is drawn when it's dealt, from the cards no one holds and the board doesn't show.
- **Drawing is passed in,** as a function that picks one card from the cards still out. The host passes one that picks at random with `crypto.randomInt`; tests pass a fixed deck, which deals given cards in order.
- **No cards are burned.** With every card drawn at random from the ones still out, a burn card changes nothing.

## Alternatives considered

- **Shuffling a deck at the start of the hand and storing it.** Simple, and the hand could be replayed from its first state, but every stored state would contain the cards still to come: a database file or backup would tell the river before the flop.
- **poker-hands' card objects in the state.** No conversion, but the history and the views are less readable, and the state would be tied to the TypeScript library's format.

## Consequences

- Stored states hold only cards that were dealt. The history still shows every card, in the state that dealt it.
- A hand can't be replayed from its first state alone; it can be from the history.
- Tests and the how-to for testing deal known cards without a seeded random generator.
