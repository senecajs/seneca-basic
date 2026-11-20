# Examples

Runnable programs that accompany the [tutorial](../tutorials/getting-started.md)
and the how-to guides. Each file loads the plugin from this repository
with `require("../..")`; in your own project write
`seneca.use("@seneca/basic")`. `seneca` 4 and `@seneca/entity` are
development dependencies of this repository, so `npm install` provides
them.

| Program | Used by | Runs on |
| ------- | ------- | ------- |
| `getting-started.js` | [Getting started](../tutorials/getting-started.md) | Seneca 4 (uses `post` and `async`/`await`) |
| `ids-and-codes.js` | [Generate ids and short codes](../how-to/generate-ids-and-short-codes.md) | Seneca 4 |
| `notes-between-plugins.js` | [Share notes between plugins](../how-to/share-notes-between-plugins.md) | Seneca 4 (callbacks) |
| `system-entities.js` | [Define system entities](../how-to/define-system-entities.md) | Seneca 4 |
| `load-entities.js` | [Load entities for actions](../how-to/load-entities-for-actions.md) | Seneca 4 |

Run an example from the repository root, for example:

```sh
node docs/examples/getting-started.js
```

Every program closes its Seneca instance on success and on failure, so
the process exits.
