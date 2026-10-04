# Decisions

Records of design decisions: what was decided, in what context, and what was rejected. They explain why the project is the way it is.

Records aren't edited after the fact, except to update their status. A decision that changes gets a new record, and the old one is marked as superseded.

| #                                                 | Decision                                                                          | Status   |
| ------------------------------------------------- | --------------------------------------------------------------------------------- | -------- |
| [0001](0001-toolchain.md)                         | ESM on Node.js 24, tested with Jest and swc                                       | Accepted |
| [0002](0002-fold-or-bet-to.md)                    | The rules take a fold or a total to bet to; buttons are translated                | Accepted |
| [0003](0003-pots-stored-at-round-end.md)          | Pots are stored at the end of each betting round, computed from the hand's totals | Accepted |
| [0004](0004-cards-as-strings-drawn-when-dealt.md) | Cards are strings, drawn when they're dealt                                       | Accepted |
| [0005](0005-every-hand-at-showdown-is-shown.md)   | Every hand that reaches showdown is shown                                         | Accepted |
| [0006](0006-new-players-by-table-option.md)       | How new players join a running game is a table option                             | Accepted |
| [0007](0007-moving-button.md)                     | The button moves to the next player dealt in                                      | Accepted |

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
