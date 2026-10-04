# Poker Game documentation

Texas Hold'em as a [Remote State](../../remote-state/docs/README.md) game. All documentation, including designs and decisions, is organized by what the reader is trying to do, following [Diátaxis](https://diataxis.fr/).

Most pages don't exist yet. Pages marked _(planned)_ are written in the same change as the behavior they describe; [BACKLOG.md](../BACKLOG.md) says which milestone delivers which page.

## Tutorials: learn by building

- _(planned)_ Play your first hand: start a local table, seat two browsers, play a hand to showdown

## How-to guides: get a specific task done

- _(planned)_ Host a table: create a table with blinds and buy-ins, admit players and spectators
- _(planned)_ Set the time limits: turn timeout, delay before the next hand
- _(planned)_ Resume tables after a restart
- _(planned)_ Build a client: actions to send, views to render
- _(planned)_ Test the rules with a fixed deck

## Reference: look up exact behavior

- _(planned)_ Table options: blinds, buy-ins, seats, time limits
- [Actions](reference/actions.md): the buttons players send, the rules' actions they become, and the buttons to show; seating and system actions are planned
- _(planned)_ State and views: the stored table state, and what each audience sees
- [Rules as implemented](reference/rules.md): blinds, betting, the uncalled bet, side pots, and awarding the pots; ranking hands at showdown is planned
- _(planned)_ Timers: names, durations, and the actions they run

## Explanation: understand the design

- [Designs](explanation/designs/README.md): proposals, starting with [Texas Hold'em](explanation/designs/holdem.md)
- [Decisions](explanation/decisions/README.md): what was decided, and why
- _(planned)_ Architecture: rules as pure functions, the plugin around them, and what Remote State does

## Writing documentation

Before writing, decide which of the four types the page is, and keep it to that type.

| The reader wants to…                                   | Type         | Folder         |
| ------------------------------------------------------ | ------------ | -------------- |
| learn by doing, guided step by step                    | Tutorial     | `tutorials/`   |
| complete a specific task they already understand       | How-to guide | `how-to/`      |
| look up exact behavior: actions, views, options, rules | Reference    | `reference/`   |
| understand how something works or why it is that way   | Explanation  | `explanation/` |

- **Design proposals** go in `explanation/designs/`, while a question is open.
- **Decision records** go in `explanation/decisions/`, numbered `NNNN-title.md`, whenever a proposal settles something.
- **When behavior changes,** update the affected reference and how-to pages in the same change.

Work still to be done isn't documentation, so it's tracked in [BACKLOG.md](../BACKLOG.md).
