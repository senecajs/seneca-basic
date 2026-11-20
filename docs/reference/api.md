# Exports and utility functions

How the plugin is loaded, what `seneca.export('basic')` returns, the
plugin definition, and the errors the plugin can produce. The action
patterns are in [Action patterns](messages.md) and the option in
[Options](options.md).

## Loading the plugin

The npm package is `@seneca/basic` (see the
[README](../../README.md#install) for the earlier package name); the
plugin name is `basic`. Any of these load it:

```js
seneca.use("basic");
seneca.use("@seneca/basic");
seneca.use(require("@seneca/basic"));
```

The plugin declares no dependencies on other plugins. The entity
patterns work with [@seneca/entity](https://github.com/senecajs/seneca-entity):
`define_sys_entity` calls `seneca.make$` and `seneca.util.parsecanon`,
which that plugin adds, and `ensure_entity` uses the entities you create
with it. Load it with `seneca.use('@seneca/entity')` before you send
those messages. The notes and identifier patterns do not need it.
`@seneca/entity` `^29.0.0` is an optional peer dependency.

## Exports

`seneca.export('basic')` returns an object with two utility functions.
The plugin's `preload` hook provides it, so it is available as soon as
`seneca.use('@seneca/basic')` returns.

| Function | Description |
| -------- | ----------- |
| [`pathnorm(path)`](#pathnorm) | Normalize a file system path and remove trailing slashes. |
| [`deepextend(...objects)`](#deepextend) | The instance's `seneca.util.deep`, kept under its old name. |

`seneca.export('util')` returns the same object: Seneca maps the export
key `util` to `basic` (a leftover from the time when these patterns
used `role:util`). The alias is deprecated: Seneca 4 warns with
`SENECA_DEP_EXPORT_UTIL`, and Seneca 5 removes it. Use
`seneca.export('basic')`.

```js
const basic = seneca.export("basic");
basic.pathnorm("/var/log//"); // '/var/log'
```

### pathnorm

`pathnorm(path)` converts `path` to a string (`null` and `undefined`
become `''`), applies Node's `path.normalize`, and removes any trailing
slashes.

| Input | Result |
| ----- | ------ |
| `''`, `null`, `undefined` | `'.'` (the normalized form of an empty path) |
| `'/a/b//'` | `'/a/b'` |
| `'a//b/../c/'` | `'a/c'` |
| `123` | `'123'` |

### deepextend

`deepextend(...objects)` is `seneca.util.deep` of the instance that loaded
the plugin: a deep merge where later arguments override earlier ones,
returning a new object. It keeps the old name for compatibility, and
does not print the deprecation warning of `seneca.util.deepextend`. New
code can call `seneca.util.deep` directly.

```js
basic.deepextend({ a: { b: 1 } }, { a: { c: 2 } }); // { a: { b: 1, c: 2 } }
```

## Plugin definition

`require('@seneca/basic')` is the plugin definition function,
`function basic(options)`, with `this` bound to the Seneca instance. It
reads the [options](options.md), adds the [action patterns](messages.md)
and returns `{ export: utilfuncs }`, the object described above.

`require('@seneca/basic').preload` is the `preload` hook. Seneca calls it
when `use` runs, before the definition function; it returns
`{ name: 'basic', export: utilfuncs }` so that the export exists early.

The plugin has no `defaults` shape, no `init` action to wait for, and no
`errors` map.

## Errors

The plugin defines no error codes of its own. The errors a message can
produce are:

| Error | Produced by | Description |
| ----- | ----------- | ----------- |
| `act_invalid_msg` (Seneca error code) | `role:basic,cmd:ensure_entity` | `pin` or `entmap` missing, or `entmap` not an object. |
| `RangeError: concurrency limit cannot be less than 1` | `define_sys_entity` | `limit.parallel` is 0 or less. |
| `action_timeout` (Seneca error code) | `define_sys_entity` | `limit.parallel` is not a number, so no entry is started and the action never replies. |
| `TypeError` | `note pop` on a key that was never pushed; `define_sys_entity` without `@seneca/entity` or with a `null` entry; a wrapped action whose `entmap` value has no `load$` or `make$` method | Runtime errors inside the action, replied as errors. |
| Store errors | `define_sys_entity`, actions wrapped by `ensure_entity` | Whatever the entity store replies for `load$` and `save$`. |

The `act` callback receives, and `seneca.post` rejects with, the
original error object, so `err.message` is the message shown above.
Seneca error codes such as `act_invalid_msg` are in `err.code`.
