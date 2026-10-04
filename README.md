# Poker Game

No-limit Texas Hold'em rules, written as plain functions, to be played in the browser through [Remote State](../remote-state).

So far, it has the betting and the pots: blinds, the allowed bets and raises, short all-ins, the buttons players click, the uncalled bet, side pots and split pots ([Rules as implemented](documentation/reference/rules.md), [Actions](documentation/reference/actions.md)). The hand, with cards and showdown, and the table come next. [BACKLOG.md](BACKLOG.md) lists the milestones, and the [Texas Hold'em design](documentation/explanation/designs/holdem.md) explains the choices behind them.

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
