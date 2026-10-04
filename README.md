# Poker Game

No-limit Texas Hold'em rules, written as plain functions, to be played in the browser through [Remote State](../remote-state).

So far, it plays a hand: blinds, dealing, betting with the buttons players click, short all-ins, the uncalled bet, side pots, and showdown ranked with poker-hands ([Rules as implemented](documentation/reference/rules.md), [Actions](documentation/reference/actions.md)). The table, with seats and the button moving from hand to hand, comes next.

## Development

Needs Node.js 24 (`nvm use` picks the version in `.nvmrc`), and [poker-hands](../poker-hands) checked out and built next to this repository: it's linked by path until version 0.12 or later is on npm.

```sh
npm install
npm test        # type-checks the sources and tests, then runs Jest
npm run lint    # ESLint, then Prettier's check
npm run format  # Prettier, applied
npm run build   # TypeScript → dist/
npm run download:hands  # real hand histories → hand-histories/ (git-ignored)
npm run verify:hands    # replays their betting through the rules
```

## Documentation

[documentation/](documentation/README.md), organized by [Diátaxis](https://diataxis.fr/): tutorials, how-to guides, reference and explanation, including design proposals and decision records.
