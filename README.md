# Poker Game

No-limit Texas Hold'em rules, written as plain functions, to be played in the browser through [Remote State](../remote-state).

So far, it runs a table: seats and buy-ins, new players joining by the table's rule, the button moving from hand to hand, and every hand from the blinds to showdown, with side pots ([Rules as implemented](documentation/reference/rules.md), [Table options](documentation/reference/table-options.md), [Actions](documentation/reference/actions.md)). Each player and the spectators get a view with only the cards they may see ([State and views](documentation/reference/state-and-views.md)). As a Remote State game, `poker-game/plugin`, hosts run tables: hands start by themselves a few seconds after the last, and a turn that runs out folds, and an all-in runout is dealt with the hands face up, one betting round at a time; after a server restart, a table with play under way waits until the host resumes it ([Host a table](documentation/how-to/host-a-table.md), [Timers](documentation/reference/timers.md)). Clients can show each hand's odds then, and spectators all along if the table lets them see the hole cards, with `poker-game/odds` ([Odds](documentation/reference/odds.md)).

## Development

Needs Node.js 24 (`nvm use` picks the version in `.nvmrc`), and [poker-hands](../poker-hands) (with its WebAssembly package) and [Remote State](../remote-state) checked out, installed and built next to this repository: they're linked by path until the versions needed are on npm.

```sh
npm install
npm test        # type-checks the sources and tests, then runs them on Node's test runner
npm run lint    # ESLint, then Prettier's check
npm run format  # Prettier, applied
npm run build   # TypeScript → dist/
npm run download:hands  # real hand histories → hand-histories/ (git-ignored)
npm run verify:hands    # replays their betting through the rules
```

## Documentation

[documentation/](documentation/README.md), organized by [Diátaxis](https://diataxis.fr/): tutorials, how-to guides, reference and explanation, including design proposals and decision records.
