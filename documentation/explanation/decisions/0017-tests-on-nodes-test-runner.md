# 0017. Tests run on Node's test runner, through tsx

Status: Accepted
Date: 2026-10-17

## Context

`npm audit` reported 19 findings, all for one advisory: [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c), a denial of service in `sprintf-js`, which has no fixed version. Jest brings it in whether coverage is on or not: `@jest/transform` depends on `babel-plugin-istanbul`, whose `@istanbuljs/load-nyc-config` still uses `js-yaml` 3, `argparse` 1 and `sprintf-js`. Jest 30.5.2 and `babel-plugin-istanbul` 8.0.0 were the latest releases, so no update removed it.

As in [Remote State's 0003](../../../../remote-state/docs/explanation/decisions/0003-no-known-vulnerabilities.md), every finding is resolved, including those in development dependencies, and replacing a dependency is preferred over overriding its transitive dependencies.

The tests used little of Jest besides `expect`: two `.each` tables, and no mocks, fake timers or snapshots.

## Decision

- **Tests run on `node:test` and assert with `node:assert/strict`.** `npm test` type-checks, then runs `node --import tsx --test` over `__tests__/**/*.test.ts`; `verify:hands` does the same over `verify/`.
- **tsx loads the TypeScript,** as ES modules, resolving the `.js` imports to the `.ts` files. It replaces Jest, swc and their configuration.
- **`__tests__/helpers/assert.ts` has the two assertions `node:assert` lacks:** `assertMatchObject`, with Jest's `toMatchObject` rules (`assert.partialDeepStrictEqual` also accepts an array with extra elements), and `assertCloseTo`.
- **Expected errors give their whole message,** since `assert.throws` compares messages exactly where Jest's `toThrow` matched part of one.

## Alternatives considered

- **Vitest.** Keeps `expect`, so the change would have been smaller. It had no findings either, but brings about twice tsx's packages, and can't compile the standard decorators Remote State's entities use without adding swc; the three repositories would no longer share one test setup.
- **`npm overrides` for `js-yaml` under Jest.** Forces a version Jest wasn't released with, and is ruled out by Remote State's 0003.
- **Node's test runner on `tsc`'s output.** No added dependency, but tests would run against a build step's output rather than the sources.

## Consequences

- This replaces the test setup of [0001](0001-toolchain.md) and supersedes [0011](0011-tests-load-esm-natively.md): tests are ES modules, and no Node flag is needed.
- `npm audit` reports 0 findings.
- Node's runner runs each test file in its own process, in parallel.
