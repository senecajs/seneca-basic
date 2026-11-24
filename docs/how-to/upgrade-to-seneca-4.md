# Upgrade to Seneca 4

Goal: move an application or plugin that uses `seneca-basic` on
Seneca 3 to `@seneca/basic` 2 on Seneca 4.

Version 2 of the plugin supports Seneca 4 only. Applications that stay
on Seneca 3 keep `seneca-basic` 1.0.0. The differences between the
Seneca versions that matter for this plugin are explained in
[Seneca 4](../explanation/seneca-4.md); this guide lists what to do.

## 1. Install

Seneca 4 needs Node.js 24 or later.

```sh
npm uninstall seneca-basic seneca-entity seneca-promisify
npm install seneca@^4 @seneca/basic
npm install @seneca/entity   # only for define_sys_entity and ensure_entity
```

The peer dependency range is `seneca ^4.0.0`. `@seneca/entity` `^29.0.0`
is an optional peer dependency: the notes and identifier patterns do not
need it. Do not keep `seneca-entity` 28: Seneca 4 cannot load it and
stops with `plugin_gubu_shape`.

## 2. Load the plugins by their package names

```js
const seneca = Seneca()
  .use("@seneca/entity")
  .use("@seneca/basic", { limit: { parallel: 5 } });
```

Seneca 4 looks up `use("basic")` as `@seneca/basic` before
`seneca-basic`, and `use("entity")` as `@seneca/entity` before
`seneca-entity`, so the short names still work. The full names make sure
that an old copy left in `node_modules` is never loaded.

Options given to `use`, or in the instance options as
`Seneca({ plugin: { basic: { limit: { parallel: 5 } } } })`, are the
same as before. A top level `basic` property (`Seneca({ basic: {...} })`)
is rejected by option validation.

## 3. Use promises

Seneca 4 has `seneca.post(msg)`, `seneca.message(pattern, asyncFn)` and
promise returning `ready()` and `close()` built in. Remove
`seneca.use("promisify")`. `post` resolves to the reply, so for
`generate_id` and `quickcode` to the string:

```js
await seneca.ready();
const id = await seneca.post("role:basic,cmd:generate_id,length:8");
```

The callback API (`act`, `ready(fn)`, `close(fn)`) works as before.

## 4. Read errors from the original error

On Seneca 4 the callback receives, and `post` rejects with, the original
error. Seneca 3 wrapped it in a Seneca error with the code `act_execute`
and the original in `err.orig`. Replace `(err.orig || err).message`
with `err.message`:

```js
try {
  await seneca.post("role:basic,note:true,cmd:pop,key:never-pushed");
} catch (err) {
  console.log(err.message);
  // Cannot read properties of undefined (reading 'pop')
}
```

Seneca's own error codes are in `err.code`, for example
`act_invalid_msg` when `ensure_entity` is sent without `pin`.

## 5. Use `seneca.export('basic')`

`seneca.export('util')` still returns the plugin's utility object, but
it is deprecated and Seneca 4 warns with `SENECA_DEP_EXPORT_UTIL`.
Write `seneca.export('basic')`. Its `deepextend` function is
`seneca.util.deep`; call `seneca.util.deep` directly in new code.

## 6. Check for deprecation warnings

Run the application or its tests once with `node --trace-deprecation`.
Seneca 4 prints a `SENECA_DEP_*` warning, with a stack, for each
Seneca 3 API that it still supports and that Seneca 5 removes. The
plugin itself causes none. The legacy `role:util` patterns and
`quickcode` log their own `DEPRECATED` notice on each call; see
[Action patterns](../reference/messages.md#legacy-roleutil-patterns).
