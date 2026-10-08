# @seneca/basic

[Seneca](https://senecajs.org) plugin with a small set of basic utility
action patterns: in-memory notes that plugins share, random identifiers
and short codes, and two helpers for
[seneca-entity](https://github.com/senecajs/seneca-entity) that record
which entities an application uses and load the entities named in a
message before an action runs. It works with Seneca 3 (tested with
3.38) and Seneca 4 (4.0.0-rc5 and later); the tests run on Node.js 24
and 22.

[![Npm][BadgeNpm]][Npm]
[![Build][BadgeBuild]][Build]

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```sh
npm install @seneca/basic
```

Versions up to 1.0.0 were published as `seneca-basic`; from the next
version the package is `@seneca/basic`. `seneca` is a peer dependency
(`>=3 || >=4.0.0-rc5`). The two entity patterns also need
`seneca-entity`:

```js
const seneca = require("seneca")()
  .use("entity") // seneca-entity: only for define_sys_entity and ensure_entity
  .use("@seneca/basic");
```

The plugin name is `basic`, so `seneca.use("basic")` loads it as well.

## Quick Example

```js
const Seneca = require("seneca");

async function main() {
  const seneca = Seneca({ log: "warn" }).use("@seneca/basic");

  try {
    await new Promise(resolve => seneca.ready(resolve));

    // Notes: values shared between the plugins of this instance.
    await seneca.post("role:basic,note:true,cmd:set,key:currency,value:EUR");
    console.log(await seneca.post("role:basic,note:true,cmd:get,key:currency"));
    // { value: 'EUR' }

    // A random identifier: lower case letters and digits.
    console.log(await seneca.post("role:basic,cmd:generate_id,length:12"));
    // lo9iyhpizez9
  } finally {
    await seneca.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
```

`seneca.post` is the promise form of `act` built into Seneca 4. On
Seneca 3 use `seneca.act(msg, callback)`, or load seneca-promisify; see
[Use with Seneca 3 and 4](docs/how-to/use-with-seneca-3-and-4.md).

## More Examples

* [Getting started](docs/tutorials/getting-started.md): notes,
  identifiers, entity definitions and entity loading in one program,
  [docs/examples/getting-started.js](docs/examples/getting-started.js).
* [Generate ids and short codes](docs/how-to/generate-ids-and-short-codes.md)
  ([program](docs/examples/ids-and-codes.js))
* [Share notes between plugins](docs/how-to/share-notes-between-plugins.md)
  ([program](docs/examples/notes-between-plugins.js))
* [Define system entities](docs/how-to/define-system-entities.md)
  ([program](docs/examples/system-entities.js))
* [Load entities for actions](docs/how-to/load-entities-for-actions.md)
  ([program](docs/examples/load-entities.js))
* [Use with Seneca 3 and 4](docs/how-to/use-with-seneca-3-and-4.md)
  ([program](docs/examples/seneca-3-and-4.js))
* All runnable programs: [docs/examples](docs/examples/README.md).

The full documentation index is [docs/README.md](docs/README.md).

## Motivation

Many Seneca applications need the same small things: a way for a
plugin to leave values for plugins loaded after it, readable random ids,
and a way to describe and load entities at the message boundary. This
plugin provides them as action patterns, so that they can be
discovered, replaced and moved like any other Seneca action. See
[What the basic plugin is for](docs/explanation/what-basic-is-for.md).

## Support

* Questions and bug reports: [GitHub issues](https://github.com/senecajs/seneca-basic/issues).
* Seneca documentation: [senecajs.org](https://senecajs.org) and the
  [Seneca 4 documentation](https://github.com/senecajs/seneca/blob/master/docs/README.md).
* Commercial support: [Voxgig](https://www.voxgig.com).

## API

Every pattern also exists with `role:util` in place of `role:basic`
(legacy names; see the reference). Details, including parameters,
replies and errors, are in [Action patterns](docs/reference/messages.md).

| Pattern | Purpose | Reply |
| ------- | ------- | ----- |
| [`role:basic,note:true,cmd:set`](docs/reference/messages.md#note-set) | Store a single value under `key`. | none |
| [`role:basic,note:true,cmd:get`](docs/reference/messages.md#note-get) | Read the value stored under `key`. | `{ value }` |
| [`role:basic,note:true,cmd:push`](docs/reference/messages.md#note-push) | Append `value` to the list under `key`. | none |
| [`role:basic,note:true,cmd:pop`](docs/reference/messages.md#note-pop) | Remove and return the last value of the list. | `{ value }` |
| [`role:basic,note:true,cmd:list`](docs/reference/messages.md#note-list) | Read the list under `key`. | array |
| [`role:basic,cmd:generate_id`](docs/reference/messages.md#generate-id) | Random id of `length` characters (default 6). | string |
| [`role:basic,cmd:quickcode`](docs/reference/messages.md#quickcode) | Random code with `length`, `alphabet` and `curses` (deprecated). | string |
| [`role:basic,cmd:define_sys_entity`](docs/reference/messages.md#define-system-entity) | Record entity definitions in `sys/entity`. | array of entities |
| [`role:basic,cmd:ensure_entity`](docs/reference/messages.md#ensure-entity) | Wrap actions so that ids and `entity$` objects in `entmap` properties become entities. | none |

| Option | Default | Reference |
| ------ | ------- | --------- |
| `limit.parallel` | `11` | [Options](docs/reference/options.md) |

| Export | Purpose | Reference |
| ------ | ------- | --------- |
| `seneca.export("basic").pathnorm(path)` | Normalize a path and remove trailing slashes. | [Exports and utility functions](docs/reference/api.md#pathnorm) |
| `seneca.export("basic").deepextend(...objects)` | The instance's `seneca.util.deepextend`. | [Exports and utility functions](docs/reference/api.md#deepextend) |

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open
participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features, please get in
touch.

The tests use the Node.js test runner and run against the Seneca 4
prerelease (development dependency `seneca@^4.0.0-rc5`) with
seneca-entity 28. Node.js 24 is the default target; Node.js 22 is also
tested.

```sh
npm install
npm test
```

To test against an unreleased Seneca build, or against Seneca 3,
install its tarball or version without saving it, then restore the
development dependency:

```sh
npm install --no-save /path/to/seneca-4.0.0.tgz && npm test
npm install --no-save seneca@3 && npm test
npm install
```

`npm run maintain` runs the repository hygiene checks of
`@seneca/maintain`; they are kept out of `npm test` because the default
branch check expects `main` while this repository uses `master`. Format
code with `npm run prettier`. The continuous integration workflow is
delivered as a patch in [.patches](.patches/README.md)
(`git am .patches/*.patch`), because workflow files need a GitHub
`workflow` scope that the preparing session did not have.

## Background

The plugin dates from 2011. Earlier Seneca releases shipped it with
the main seneca module; Seneca 3.38 (whose only default plugin is
transport) and Seneca 4 (which has none) do not, so applications load
it with `use`. Versions up to 1.0.0 were published as `seneca-basic`;
from the next version the package is `@seneca/basic`. Version 0.3.0
(2015) normalized the note patterns, version 0.5.0 (2016) added Seneca 3
support, and version 1.1.0 (2026) adds Seneca 4 support, fixes
`ensure_entity`, drops the `lodash` dependency and reorganizes the
documentation. Changes between versions are listed in
[CHANGES.md](CHANGES.md).

| Seneca | Plugin | Node.js |
| ------ | ------ | ------- |
| 3.x (tested with 3.38) | 1.1.0 and later; 1.0.0 except `role:basic,cmd:ensure_entity` | tested on 24 and 22 |
| 4.0.0-rc5 and 4.0.0 | 1.1.0 and later; 1.0.0 except `ensure_entity` | 22 or later (a Seneca 4.0.0 requirement); tested on 24 and 22 |

Licensed under [MIT](LICENSE). Copyright (c) 2011-2026 Richard Rodger
and other contributors.

[BadgeNpm]: https://badge.fury.io/js/%40seneca%2Fbasic.svg
[Npm]: https://www.npmjs.com/package/@seneca/basic
[BadgeBuild]: https://github.com/senecajs/seneca-basic/actions/workflows/build.yml/badge.svg
[Build]: https://github.com/senecajs/seneca-basic/actions/workflows/build.yml
