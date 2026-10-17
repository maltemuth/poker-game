# 0001. ESM on Node.js 24, tested with Jest and swc

Status: Accepted; tests run on Node's test runner since [0017](0017-tests-on-nodes-test-runner.md)
Date: 2026-10-04

## Context

poker-game will be a Remote State plugin, and depends on poker-hands for ranking hands. Both are ES modules and need Node.js 24 ([Remote State's 0002](../../../../remote-state/docs/explanation/decisions/0002-node-24.md) and [0004](../../../../remote-state/docs/explanation/decisions/0004-esm-with-jest.md); poker-hands since 0.12). The sketch it started from was CommonJS on Node 22, with no tests.

## Decision

- **ESM on Node.js 24:**
  - `"type": "module"`, with an `exports` map;
  - TypeScript 6 with `"module": "node20"`, so relative imports end in `.js`;
  - Node 24 in `.nvmrc` and `engines`, enforced by `engine-strict`.
- **Tests run on Jest 30, compiled by swc.**
  - `@swc/jest` compiles each test to CommonJS, and a `moduleNameMapper` maps the `.js` imports back to the `.ts` files. This is the setup poker-hands uses.
  - swc doesn't type-check, so `npm test` runs `tsc` on the sources and tests first.
- **ESLint 10 and Prettier 3.** Prettier's one setting, trailing commas as in ES5, is in `.prettierrc.json`.
- **Dependencies are added when a milestone needs them.** poker-hands comes with the hand, and Remote State with the plugin. Both are linked by local path until the versions needed are on npm.

## Alternatives considered

- **Jest's native ESM mode with `ts-jest`,** as Remote State uses. It runs the tests as ES modules, but needs `--experimental-vm-modules` and prints a warning on every run. The rules have no ESM-only behavior to test: they're plain functions.
- **Vitest.** Runs TypeScript and ESM without flags, but would make poker-game the only repository of the three not on Jest.

## Consequences

- The tests run as CommonJS. Code that relies on ESM-only features, such as `import.meta`, needs care in tests.
- poker-game can depend on either library only once it's ESM itself; the sketch's CommonJS import of poker-hands 0.3.1 is gone.
- Remote State and poker-hands aren't on npm in the versions needed, so `npm install` needs the three repositories next to each other until they are.
