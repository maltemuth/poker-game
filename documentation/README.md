# Poker Game documentation

Texas Hold'em as a [Remote State](../../remote-state/docs/README.md) game. All documentation, including designs and decisions, is organized by what the reader is trying to do, following [Diátaxis](https://diataxis.fr/).

Most pages don't exist yet. Pages marked _(planned)_ are written in the same change as the behavior they describe; [BACKLOG.md](../BACKLOG.md) says which milestone delivers which page.

## Tutorials: learn by building

- _(planned)_ Play your first hand: start a local table, seat two browsers, play a hand to showdown

## How-to guides: get a specific task done

- [Host a table](how-to/host-a-table.md): create a table, admit people, how hands start, pause, after a restart
- _(planned)_ Set the time limits: turn timeout, delay before the next hand
- _(planned)_ Resume tables after a restart
- _(planned)_ Build a client: actions to send, views to render
- [Test the rules with a fixed deck](how-to/test-with-a-fixed-deck.md)

## Reference: look up exact behavior

- [Table options](reference/table-options.md): blinds, buy-ins, seats, how new players join, and the delay before each hand
- [Actions](reference/actions.md): seating and betting at the table, the system's actions, the rules' actions the buttons become, and the buttons to show
- [State and views](reference/state-and-views.md): the stored table state, the audiences, and what each sees
- [Rules as implemented](reference/rules.md): blinds, betting, dealing, the uncalled bet, side pots, awarding the pots, showdown, and the table between hands
- [Timers](reference/timers.md): the `nextHand` timer; the turn timer is planned

## Explanation: understand the design

- [Designs](explanation/designs/README.md): proposals, starting with [Texas Hold'em](explanation/designs/holdem.md)
- [Decisions](explanation/decisions/README.md): what was decided, and why
- [Architecture](explanation/architecture.md): the layers, plain functions of plain data, the life of an action, hidden information

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
