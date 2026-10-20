# Decisions

Records of design decisions: what was decided, in what context, and what was rejected. They explain why the project is the way it is.

Records aren't edited after the fact, except to update their status. A decision that changes gets a new record, and the old one is marked as superseded.

| #                                                   | Decision                                                                          | Status                                               |
| --------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [0001](0001-toolchain.md)                           | ESM on Node.js 24, tested with Jest and swc                                       | Accepted; tests on Node's test runner since 0017     |
| [0002](0002-fold-or-bet-to.md)                      | The rules take a fold or a total to bet to; buttons are translated                | Accepted                                             |
| [0003](0003-pots-stored-at-round-end.md)            | Pots are stored at the end of each betting round, computed from the hand's totals | Accepted                                             |
| [0004](0004-cards-as-strings-drawn-when-dealt.md)   | Cards are strings, drawn when they're dealt                                       | Accepted                                             |
| [0005](0005-every-hand-at-showdown-is-shown.md)     | Every hand that reaches showdown is shown                                         | Accepted; all-in hands tabled earlier since 0015     |
| [0006](0006-new-players-by-table-option.md)         | How new players join a running game is a table option                             | Accepted                                             |
| [0007](0007-moving-button.md)                       | The button moves to the next player dealt in                                      | Accepted                                             |
| [0008](0008-busted-players-become-spectators.md)    | Players without chips become spectators                                           | Accepted                                             |
| [0009](0009-standing-up-folds.md)                   | Standing up folds                                                                 | Accepted                                             |
| [0010](0010-standing-up-is-a-break.md)              | Standing up is a break; leaving takes the chips                                   | Accepted                                             |
| [0011](0011-tests-load-esm-natively.md)             | Tests load ES modules natively                                                    | Superseded by 0017                                   |
| [0012](0012-host-controls-the-table.md)             | The host controls the table                                                       | Accepted                                             |
| [0013](0013-hands-start-by-themselves.md)           | Hands start by themselves, after a delay                                          | Accepted                                             |
| [0014](0014-a-turn-that-runs-out-folds.md)          | A turn that runs out folds; its length is a table option                          | Accepted; views carry the turn's deadline since 0019 |
| [0015](0015-all-in-hands-are-tabled.md)             | All-in hands are tabled, and the runout is dealt one betting round at a time      | Accepted                                             |
| [0016](0016-spectators-may-see-hole-cards.md)       | Spectators may see the hole cards, if the table allows it                         | Accepted                                             |
| [0017](0017-tests-on-nodes-test-runner.md)          | Tests run on Node's test runner, through tsx                                      | Accepted                                             |
| [0018](0018-tables-are-interrupted-by-a-restart.md) | A restart interrupts a table until the host resumes it                            | Accepted                                             |
| [0019](0019-the-turns-deadline-is-in-the-state.md)  | The turn's deadline is in the state                                               | Accepted                                             |
| [0020](0020-options-change-until-the-first-hand.md) | The host can change the options until the first hand                              | Accepted                                             |

## Writing a record

Create `NNNN-short-title.md`, numbered after the last one, and add it to the table:

```markdown
# NNNN. <What was decided>

Status: Accepted
Date: YYYY-MM-DD

## Context

## Decision

## Alternatives considered

## Consequences
```
