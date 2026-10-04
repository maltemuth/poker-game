# Host a table

Run Hold'em tables in a [Remote State](../../../remote-state/docs/README.md) server: create a table, admit people, and start the hands.

## Create the server with the plugin

```ts
import { createRemoteStateServer } from "@malte.muth/remote-state";
import { createHoldemPlugin } from "poker-game/plugin";
import { newTable } from "poker-game";

const server = await createRemoteStateServer(createHoldemPlugin());
await server.startServer();
```

The plugin draws cards at random. Pass `createHoldemPlugin({ draw })` to deal known cards, as in tests ([Test the rules with a fixed deck](test-with-a-fixed-deck.md)). Server options, such as the database file, are Remote State's ([Server API](../../../remote-state/docs/reference/server-api.md)).

## Create a table

A table is a game whose initial state comes from `newTable`:

```ts
const gameId = await server.createGame(
  newTable({
    blinds: { small: 50, big: 100 },
    buyIn: { min: 2000, max: 10000 },
    seats: 6,
    newPlayers: "waitForBigBlind",
  })
);
```

See [Table options](../reference/table-options.md) for what each option does. Invalid options throw before the game is created. Keep the `gameId`: Remote State can't list a server's games.

## Admit people

Give each person a code, and send it to their client:

```ts
const code = await server.admit({
  gameId,
  identity: { id: user.id, name: user.name },
});
```

The client redeems it at `POST /api/tokens` for a token. Everyone joins as a spectator, with the `name` you passed; without one, they're called "Player". From there, they sit down themselves, with `{ type: "sitDown", seat, buyIn }` ([Actions](../reference/actions.md)).

## Start each hand

Hands don't start by themselves yet. Start one when at least two players are seated, and after each hand is over:

```ts
const result = await server.act(gameId, { type: "startHand" });
if ("rejected" in result) console.log(result.rejected); // e.g. "Waiting for players"
```

A hand is over when its view's `hand.result` isn't `null`. Leave a few seconds before starting the next one, so the players can see who won.

## Pause and resume

```ts
await server.act(gameId, { type: "pause" }); // no new hands; the current one is played out
await server.act(gameId, { type: "resume" });
```

## What clients get

Each person's view is a [`TableView`](../reference/state-and-views.md#views): a seated player sees their own hole cards and their buttons, everyone else the spectators' view. Clients send the buttons as actions to `POST /api/games/:gameId/actions` ([Actions](../reference/actions.md)). Remote State's client package keeps a view in step with the server ([Connect a browser client](../../../remote-state/docs/how-to/connect-a-client.md)).
