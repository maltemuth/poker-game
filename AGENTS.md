# AGENTS.md

Guidelines for coding agents working on poker-game.

## Environment

Node.js 24, from `.nvmrc`. Run npm and node through `nvm use`, or with Node 24 first in `PATH`.

```sh
npm test        # tsc on sources and tests, then Jest
npm run lint    # ESLint and Prettier's check; run before every commit
npm run format  # Prettier, applied
```

## Code

- **Small files, one rule or query each.** For example, posting the blinds, the allowed actions and splitting a pot are separate files.
- **Every file starts with a comment that says what it's for:** what the file is responsible for, and anything a reader must know to use it. It's not a list of what the code does line by line.
- **The rules are plain functions of plain data.** They take a state and return a new one, and never modify their arguments. States are JSON: no classes, `Map`s, `Set`s or `undefined` properties.
- **Rejections are values.** A rule that refuses an action returns the reason as a string; it doesn't throw. Throw only for programming errors, such as an argument that can't happen.
- **Layers:**
  - the rules come first: betting, then the hand, then the table;
  - the Remote State plugin is a thin layer over them;
  - only the plugin imports `@malte.muth/remote-state`.
- **Imports end in `.js`,** as ESM requires (`import { pots } from "./pots.js"`); Jest maps them to the `.ts` files.

## Tests

- Tests live in `__tests__/`, mirroring `src/`, as `<name>.test.ts`. Each test file also starts with a comment saying what it covers.
- Test every rule on its own, with plain objects built in the test.
- Wherever chips move, check that they're conserved: stacks plus everything in pots add up to the same total before and after.
- `verify/` checks the rules against real hand histories (`npm run download:hands`, then `npm run verify:hands`). It's not part of `npm test`; run it after changing the betting rules.

## Documentation

- Documentation follows [Diátaxis](https://diataxis.fr/); see [documentation/README.md](documentation/README.md#writing-documentation) for where a page goes.
- When behavior changes, update the affected reference and how-to pages in the same change.
- Design questions go in `documentation/explanation/designs/`, and settled ones get a decision record in `documentation/explanation/decisions/`.
- Planned work is in [BACKLOG.md](BACKLOG.md). Remove a milestone when it's done.

## Commits

- One change per commit, with a [Conventional Commits](https://www.conventionalcommits.org/) message, such as `feat(betting): post the blinds`.
- Work on `master`; no feature branches.
