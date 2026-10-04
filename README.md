# Poker Game

No-limit Texas Hold'em rules, written as plain functions, to be played in the browser through [Remote State](../remote-state).

So far, it has the betting: blinds, the allowed bets and raises, short all-ins, and the buttons players click ([Rules as implemented](documentation/reference/rules.md), [Actions](documentation/reference/actions.md)). Side pots, the hand and the table come next. [BACKLOG.md](BACKLOG.md) lists the milestones, and the [Texas Hold'em design](documentation/explanation/designs/holdem.md) explains the choices behind them.

## Development

Needs Node.js 24 (`nvm use` picks the version in `.nvmrc`).

```sh
npm install
npm test        # type-checks the sources and tests, then runs Jest
npm run lint    # ESLint, then Prettier's check
npm run format  # Prettier, applied
npm run build   # TypeScript → dist/
```

## Documentation

[documentation/](documentation/README.md), organized by [Diátaxis](https://diataxis.fr/): tutorials, how-to guides, reference and explanation, including design proposals and decision records.
