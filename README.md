# Poker Game

No-limit Texas Hold'em rules, written as plain functions, to be played in the browser through [Remote State](../remote-state).

So far, it runs a table: seats and buy-ins, new players joining by the table's rule, the button moving from hand to hand, and every hand from the blinds to showdown, with side pots ([Rules as implemented](documentation/reference/rules.md), [Table options](documentation/reference/table-options.md), [Actions](documentation/reference/actions.md)). Each player and the spectators get a view with only the cards they may see ([State and views](documentation/reference/state-and-views.md)). Next comes the Remote State plugin.

## Development

Needs Node.js 24 (`nvm use` picks the version in `.nvmrc`), and [poker-hands](../poker-hands) and [Remote State](../remote-state) checked out, installed and built next to this repository: they're linked by path until the versions needed are on npm.

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
