# Test the rules with a fixed deck

Hands draw each card when it's dealt, through a `Draw` function ([0004](../explanation/decisions/0004-cards-as-strings-drawn-when-dealt.md)). Real hands use `randomDraw`. To test a hand with known cards, pass `fixedDraw` with the cards in the order they're dealt.

## Put the cards in dealing order

The hand deals:

1. **Hole cards,** one at a time, clockwise from the first player left of the button, twice around.
2. **The flop,** three cards, when the first betting round is over.
3. **The turn** and **the river,** one card each, after the next betting rounds.

No cards are burned. With three players and the button on the first (index 0), the order is: player 2's first card, player 3's, player 1's, then their second cards in the same order, then the board.

```ts
import { fixedDraw, startHand } from "poker-game";

const draw = fixedDraw([
  "Kd",
  "7c",
  "Ah", // first hole cards: players 2, 3, 1
  "Kc",
  "2d",
  "As", // second hole cards
  "Kh",
  "9s",
  "4d", // flop
  "Qc", // turn
  "3h", // river
]);

const players = [
  { seat: 1, stack: 2000 },
  { seat: 2, stack: 600 },
  { seat: 3, stack: 2000 },
];
const hand = startHand(players, 0, { small: 50, big: 100 }, draw);
// hand.holeCards: [["Ah", "As"], ["Kd", "Kc"], ["7c", "2d"]]
```

Pass the same `draw` to every `applyHandAction` of the hand, so the board comes from the same deck.

## Write the cards per player instead

Ordering the cards by hand is easy to get wrong. The tests have a helper, [`deck`](../../__tests__/helpers/hand.ts), that takes each player's hole cards in seat order, the button, and the board, and puts them in dealing order:

```ts
import { deck, players } from "../helpers/hand.js";

const draw = deck(["AhAs", "KdKc", "7c2d"], 0, "Kh9s4dQc3h");
const hand = startHand(players(2000, 600, 2000), 0, blinds, draw);
```

## Give only the cards the hand needs

A hand that ends before the river needs fewer cards: one that's folded before the flop needs only the hole cards. If the hand draws more cards than the deck has, `fixedDraw` throws `The fixed deck is used up`. A card that's already dealt throws `<card> isn't out`, so a typo that repeats a card shows up at once.

## Play the hand

Act with the buttons players click, translated for the player to act:

```ts
import { applyHandAction, translateUiAction } from "poker-game";

const action = translateUiAction(hand.betting, { type: "raise", to: 300 });
if (typeof action === "string") throw new Error(action);
const next = applyHandAction(hand, action, draw);
```

When the hand is over, `next.result` has the hands shown at showdown and who won what, per pot. The scripted hands in [`__tests__/hand/scenarios.test.ts`](../../__tests__/hand/scenarios.test.ts) are complete examples.
