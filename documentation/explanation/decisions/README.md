# Decisions

Records of design decisions: what was decided, in what context, and what was rejected. They explain why the project is the way it is.

Records aren't edited after the fact, except to update their status. A decision that changes gets a new record, and the old one is marked as superseded.

| #                         | Decision                                    | Status   |
| ------------------------- | ------------------------------------------- | -------- |
| [0001](0001-toolchain.md) | ESM on Node.js 24, tested with Jest and swc | Accepted |

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
