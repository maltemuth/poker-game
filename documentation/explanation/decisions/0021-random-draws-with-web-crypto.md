# 0021. Random draws use the Web Crypto API, so the package loads in browsers

Status: Accepted
Date: 2026-10-20

## Context

Cards are drawn with a function passed in, and real hands draw at random ([0004](0004-cards-as-strings-drawn-when-dealt.md)), with Node's `crypto.randomInt`. The package's root entry exports that function, so importing anything from it, in a browser, loads `node:crypto`, which browsers don't have. Clients need the root entry: poker-ui's form for table options checks them with `optionProblems` before sending ([0020](0020-options-change-until-the-first-hand.md)).

## Decision

- **`randomDraw` takes its random numbers from `globalThis.crypto.getRandomValues`,** the Web Crypto API, which Node.js 24 and browsers both have. Every card still out stays equally likely: a random 32-bit number from the top, incomplete run of the number of cards out is drawn again.
- **The package's source imports none of Node's own modules,** and a test makes sure of it. What only runs on a server, such as the plugin, is still on its own entry point, `poker-game/plugin`.

## Alternatives considered

- **A browser-safe entry point,** such as `poker-game/options`, for the option checks alone. It keeps `node:crypto`, but every client would have to know which entry is safe, and the views and rules would stay out of a browser's reach.
- **`Math.random`.** Available everywhere, but not cryptographically secure, so the next cards could be predicted.

## Consequences

- Clients can import the rules, the views and the option checks from `poker-game` directly.
- The draw needs a few more lines than `randomInt`, with a test for redrawing.
