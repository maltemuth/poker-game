# Odds

[`viewOdds(handView)`](../../src/odds/viewOdds.ts), from `poker-game/odds`, gives each hand's chances, for a client to show ([0015](../explanation/decisions/0015-all-in-hands-are-tabled.md)).

```ts
import { viewOdds } from "poker-game/odds";

const odds = viewOdds(view.hand); // view: a TableView
// [{ seat: 1, winChance: 0.81, tieChance: 0.004 }, { seat: 2, winChance: 0.19, tieChance: 0.004 }]
```

```ts
interface PlayerOdds {
  seat: number;
  winChance: number; // the share of the ways to complete the board on which this hand alone wins
  tieChance: number; // the share on which it ties for the best hand
}
```

## When there are odds

`viewOdds` returns the odds of every hand still in when the view knows them all:

- **during an all-in runout,** once the hands are tabled, in every view;
- **during the whole hand,** in the spectators' view at a table whose `spectatorsSeeHoleCards` is on ([0016](../explanation/decisions/0016-spectators-may-see-hole-cards.md)).

It returns `null` when a hand still in is hidden from the viewer, fewer than two hands are left, or the hand is over: its `result` says who won.

## How they're computed

- **Exactly,** over every way to complete the board shown so far, with [`@malte.muth/poker-hands-wasm`](../../../poker-hands/packages/wasm/README.md). Before the flop, that's up to about 1.7 million boards for two hands, which takes about 60 milliseconds.
- **Folded hands don't count,** even when the viewer knows them, so their cards can still appear on the boards counted.
- **Only clients that import `poker-game/odds` load the WebAssembly package;** the rules and the plugin don't.
