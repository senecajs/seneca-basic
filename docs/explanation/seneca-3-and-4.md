# Seneca 3 and 4

The plugin runs on Seneca 3 (tested with 3.38) and on Seneca 4 (tested
with 4.0.0-rc5 and the unreleased 4.0.0); its test suite passes on all
three. This page lists the differences between the Seneca versions that
touch the plugin, and what the plugin does about each. The practical
steps are in [Use with Seneca 3 and 4](../how-to/use-with-seneca-3-and-4.md).

| Topic | Seneca 3.38 | Seneca 4 | In the plugin |
| ----- | ----------- | -------- | ------------- |
| `seneca.util.recurse` | Available. | Removed. | Version 1.1.0 iterates with `async.eachSeries` in `ensure_entity`; 1.0.0 failed on Seneca 4 with `seneca.util.recurse is not a function`. |
| Validation rules in patterns | Object values are compiled into Gubu 8 shapes. | Compiled into Gubu 9 shapes. | The `ensure_entity` rules are built with `seneca.util.Gubu`, the core's own copy, so they compile on both. |
| Error replies | A Seneca error wrapping the original (`err.orig`), code `act_execute`. | The original error; the Seneca wrapper is in `err.meta$.err`. | The documentation uses `(err.orig || err).message` where code must run on both. |
| Plugin options | `use()` options and `plugin.basic`. A top level `basic` property fails option validation. | The same. | The plugin carries its own default (`limit.parallel: 11`). |
| Promises | Through seneca-promisify. | Built in (`post`, `message`, `ready`, `close`). | Examples that must run on both use callbacks. |
| `await seneca.ready()` | Needs seneca-promisify. | Built in; does not resolve on an idle instance in 4.0.0-rc5. | Examples use the callback form. |
| `seneca.export('util')` | Mapped to `basic`. | Mapped to `basic`. | Both names return the utility object. |
| Deprecation warnings | `debug.deprecation` is on by default. | The same. | The `role:util` note patterns and `quickcode` log a warning per call. |
| Node.js | 3.38 declares 10 or later. | 4.0.0 requires 22 or later; the rc5 package still declares 14. | The tests run on Node.js 24 and 22. |
| seneca-entity | Works with seneca-entity 28. | Works with seneca-entity 28. | The tests use seneca-entity 28, which provides `seneca.util.parsecanon` and `make$`. |

## What broke in version 1.0.0

Two things, both in `ensure_entity`:

1. The wrapper it adds called `seneca.util.recurse`, a legacy helper
   that Seneca 4 no longer exposes, so every wrapped action failed with
   a `TypeError`. Version 1.1.0 iterates over the entity properties with
   `async.eachSeries`, in the same order and with the same stop on the
   first error.
2. The `role:basic,cmd:ensure_entity` pattern declared its parameters as
   rule objects in an older style: `pin: { required$: true }` and
   `entmap: { object$: true, required$: true }`. Seneca 3.38 and Seneca 4
   compile object values in a pattern into Gubu shapes, and these
   objects became closed shapes that rejected every real `pin` and
   `entmap` with `act_invalid_msg`. This was already broken on Seneca
   3.38; only the legacy `role:util,cmd:ensure_entity` pattern, which has
   no rules, worked. Version 1.1.0 expresses the same rules with Gubu
   builders (`Required(Any())` and `Required(Open({}))`), using
   `seneca.util.Gubu` so that the shape comes from the same Gubu copy
   that compiles it. Seneca releases without `seneca.util.Gubu` keep the
   old rule objects.

Version 1.1.0 also fixes a hang that did not depend on the Seneca
version: a wrapped action whose `entmap` property held a plain object
without `entity$` or `$` never replied. Such values now pass through
unchanged.

The notes, identifier and `define_sys_entity` patterns worked on Seneca
4 without changes.

## Supporting both versions

The plugin uses only APIs that behave the same on both versions:
callbacks, `seneca.add`, `seneca.wrap`, `seneca.prior`, `seneca.export`
and the entity API. The only version dependent code is the check for
`seneca.util.Gubu`. The peer dependency range `>=3 || >=4.0.0-rc5`
admits both versions; a bare `>=3` would exclude the Seneca 4
prerelease, because npm ranges do not match prereleases unless they say
so.

## When Seneca 4.0.0 is published

The development dependency `seneca@^4.0.0-rc5` resolves to 4.0.0 once
it exists, and the peer range already includes it. The `ready()`
promise behaves on 4.0.0, so the callback form in the examples is a
precaution there rather than a requirement.
