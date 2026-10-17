# 0011. Tests load ES modules natively

Status: Superseded by [0017](0017-tests-on-nodes-test-runner.md)
Date: 2026-10-04

## Context

The tests are compiled to CommonJS by swc and run without Node flags ([0001](0001-toolchain.md)). poker-hands is ESM only, so its build was compiled by swc as well. Remote State depends on MikroORM, which is ESM only too, and too large to compile along. Jest 30 can `require()` ES modules natively on Node 24.9 and later, when Node runs with `--experimental-vm-modules`.

## Decision

- **Jest runs with `--experimental-vm-modules`,** so CommonJS tests load ES modules natively: Remote State, MikroORM, poker-hands. Node's experimental warning is silenced with `--disable-warning=ExperimentalWarning`.
- **Our sources and tests are still compiled to CommonJS by swc,** as before.
- **swc no longer compiles poker-hands' build.**

## Alternatives considered

- **Jest's full ESM mode,** running the tests themselves as ES modules, as Remote State does. Not needed: the tests can stay CommonJS once dependencies load natively.
- **Compiling every ESM dependency with swc.** Slow, and fragile for packages like MikroORM.
- **Running the plugin's integration tests outside Jest,** with Node's test runner against the build. Two test setups for one package.

## Consequences

- The test scripts set `NODE_OPTIONS`; running `npx jest` directly needs the flag too.
- The flag is experimental; a Node or Jest upgrade could change how it behaves.
