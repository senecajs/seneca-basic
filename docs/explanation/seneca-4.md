# Seneca 4

Version 2 of the plugin runs on Seneca 4 only, and its peer dependency
range is `seneca ^4.0.0`. Seneca 3 applications keep `seneca-basic`
1.0.0. This page lists the differences between Seneca 3 and Seneca 4
that touch the plugin, and what the plugin does about each. The
practical steps are in [Upgrade to Seneca 4](../how-to/upgrade-to-seneca-4.md).

| Topic | Seneca 3.38 | Seneca 4 | In the plugin |
| ----- | ----------- | -------- | ------------- |
| `seneca.util.recurse` | Available. | Removed. | `ensure_entity` iterates with `async.eachSeries`; 1.0.0 failed on Seneca 4 with `seneca.util.recurse is not a function`. |
| Validation rules in patterns | Object values are compiled into Gubu shapes. | Compiled with shape; `seneca.util.Gubu` is a deprecated alias of `seneca.util.Shape`. | The `ensure_entity` rules are built with `seneca.valid`, the builders of the core's own shape copy. |
| `seneca.util.deepextend` | Available. | Deprecated alias of `seneca.util.deep`. | The plugin merges its options with `seneca.util.deep`, and the exported `deepextend` is `seneca.util.deep`. |
| Error replies | A Seneca error wrapping the original (`err.orig`), code `act_execute`. | The original error. | The documentation reads `err.message` and `err.code` directly. |
| Plugin options | `use()` options and `plugin.basic`. A top level `basic` property fails option validation. | The same. | The plugin carries its own default (`limit.parallel: 11`). |
| Promises | Through seneca-promisify. | Built in (`post`, `message`, `ready`, `close`). | The examples use `await`. |
| `seneca.export('util')` | Mapped to `basic`. | Mapped to `basic`, with the deprecation warning `SENECA_DEP_EXPORT_UTIL`. | Use `seneca.export('basic')`. |
| Short plugin names | `use('basic')` finds `seneca-basic`. | `use('basic')` finds `@seneca/basic` first, then `seneca-basic`. | The package is `@seneca/basic`; the plugin name stays `basic`. |
| Entities | seneca-entity 28. | `@seneca/entity` 29; seneca-entity 28 cannot be loaded (`plugin_gubu_shape`). | The tests use `@seneca/entity` 29, which provides `seneca.util.parsecanon` and `make$`. |
| Node.js | 3.38 declares 10 or later. | 24 or later. | `engines.node` is `>=24`. |

## What broke in version 1.0.0

Two things, both in `ensure_entity`:

1. The wrapper it adds called `seneca.util.recurse`, a legacy helper
   that Seneca 4 no longer exposes, so every wrapped action failed with
   a `TypeError`. The plugin now iterates over the entity properties
   with `async.eachSeries`, in the same order and with the same stop on
   the first error.
2. The `role:basic,cmd:ensure_entity` pattern declared its parameters as
   rule objects in an older style: `pin: { required$: true }` and
   `entmap: { object$: true, required$: true }`. Seneca 3.38 and Seneca 4
   compile object values in a pattern into shapes, and these objects
   became closed shapes that rejected every real `pin` and `entmap` with
   `act_invalid_msg`. This was already broken on Seneca 3.38; only the
   legacy `role:util,cmd:ensure_entity` pattern, which has no rules,
   worked. The plugin now expresses the same rules with the builders
   that Seneca provides as `seneca.valid`: `Required(Any())` and
   `Required(Open({}))`.

These fixes were first made in the unpublished version 1.1.0, which
also supported Seneca 3. Version 1.1.0 also fixed a hang that did not
depend on the Seneca version: a wrapped action whose `entmap` property
held a plain object without `entity$` or `$` never replied. Such values
now pass through unchanged.

The notes, identifier and `define_sys_entity` patterns worked on Seneca
4 without changes.

## Why Seneca 4 only

Supporting both versions meant a version check in the plugin and a
second test run. Version 2 drops both: it builds its rules with
`seneca.valid` and uses no deprecated Seneca API, so it runs on
Seneca 4 without `SENECA_DEP_*` warnings. Dropping Seneca 3 is a
breaking change, which, together with the move from `seneca-basic` to
`@seneca/basic`, is why the version is 2.0.0.
