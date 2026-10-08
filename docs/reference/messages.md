# Action patterns

Every action pattern the plugin adds, with parameters, reply and errors.
Patterns are shown in Jsonic form:
`seneca.act('role:basic,note:true,cmd:get,key:name', cb)` and
`seneca.act({ role: 'basic', note: true, cmd: 'get', key: 'name' }, cb)`
send the same message. On Seneca 4, `seneca.post(msg)` returns the
reply as a promise; see
[Use with Seneca 3 and 4](../how-to/use-with-seneca-3-and-4.md). The
behaviour described here is the same on Seneca 3.38, 4.0.0-rc5 and
4.0.0, except for the form of errors (see
[Errors](api.md#errors)).

Every pattern also exists with `role:util` in place of `role:basic`; see
[Legacy role:util patterns](#legacy-roleutil-patterns).

## Notes

Notes are values kept in memory by the plugin. There are two stores:
single values (`set`, `get`) and lists (`push`, `pop`, `list`). A key
may be used in both stores; they do not interact. The stores belong to
the plugin instance: a second Seneca instance has its own notes, and
nothing is persisted.

### note set

Pattern: `role:basic,note:true,cmd:set`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | string | The note name. Any string; a prefix such as `shop/` keeps plugins apart. |
| `value` | any | The value to store. It replaces an earlier value for the key. |

Reply: none (the callback receives `null` as the result).

### note get

Pattern: `role:basic,note:true,cmd:get`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | string | The note name. |

Reply: `{ value }`, where `value` is the stored value, or `undefined`
when nothing was set for the key (the reply is then `{ value: undefined }`,
which serializes as `{}`).

### note push

Pattern: `role:basic,note:true,cmd:push`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | string | The list name. |
| `value` | any | Appended to the list; the list is created on the first push. |

Reply: none (`null`).

### note pop

Pattern: `role:basic,note:true,cmd:pop`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | string | The list name. |

Removes the last pushed value and replies `{ value }`. When the list
exists but is empty the reply is `{ value: undefined }`. When nothing was
ever pushed for the key the action fails with a `TypeError`, replied as
an error: push before you pop, or check with `list` first.

### note list

Pattern: `role:basic,note:true,cmd:list`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | string | The list name. |

Reply: the array of pushed values in push order, or `[]` when nothing
was pushed. The array is the stored list itself, not a copy: changing it
changes the note.

## Identifiers

Both patterns use the [nid](https://www.npmjs.com/package/nid) module
(version 0.3): random characters are drawn from an alphabet until the
length is reached, and a result that contains a word from a curse list
is discarded and generated again. The replies are plain strings, not
objects. The characters are drawn with `Math.random()`, so the
identifiers are not cryptographically secure and must not be used as
secrets (see
[Generate ids and short codes](../how-to/generate-ids-and-short-codes.md)).

### Generate id

Pattern: `role:basic,cmd:generate_id`

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `length` | number | `6` | Number of characters. |

Reply: a string of `length` characters from
`0123456789abcdefghijklmnopqrstuvwxyz` that does not contain one of
nid's built in curse words. The generator for each length up to 64 is
created once and cached; longer lengths create a generator per call.

Ids are random and are not checked for uniqueness. A 6 character id has
36^6 (about 2.2 billion) possible values; raise `length` where that is
not enough.

### Quickcode

Pattern: `role:basic,cmd:quickcode`

Deprecated. The pattern carries the notice `marked for removal in
future`, and Seneca logs a `DEPRECATED` warning on every call while the
`debug.deprecation` option is true (the default in Seneca 3 and 4). Use
`generate_id`, or nid directly (`seneca.util.Nid`), in new code.

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `length` | number or string of digits | `8` | Number of characters. `len` is accepted as an alias. The value goes through `parseInt`: a value that does not parse (such as `'abc'`) leaves the length to nid, whose own default is 6, and `0` gives the default of 8. |
| `alphabet` | string | `0123456789abcdefghijklmnopqrstuvwxyz` | The characters to draw from. |
| `curses` | regular expression, function, array of strings or comma separated string | nid's built in list | Codes that match the regular expression, for which the function returns true, or whose lower case form contains one of the strings, are rejected and generated again. Write the strings in lower case: the code is lower cased before the comparison, the strings are not. A value replaces the built in list. |

Reply: a string. Each call creates a new nid generator.

A curse rule that rejects every possible code (for example `/./`)
makes the action loop forever, which blocks the process: nid generates
codes until one is accepted.

## Entities

Both patterns work with [seneca-entity](https://github.com/senecajs/seneca-entity).
`define_sys_entity` calls `seneca.make$` and `seneca.util.parsecanon`,
which that plugin adds; without it the action fails with a `TypeError`.
`ensure_entity` calls the `load$` and `make$` methods of the entities you
give it in `entmap`.

### Define system entity

Pattern: `role:basic,cmd:define_sys_entity`

Records, in the `sys/entity` collection of the entity store, the entities
an application uses: zone, base, name and a list of field names. Other
plugins (an admin interface, for example) can then list them.

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `list` | array or string | one entry built from the message | The entries to define. A string is split on commas: `'shop/product, shop/order'`. |
| `entity` | string | | Canon string of a single entry (`zone/base/name`, `base/name` or `name`; `-` for an omitted part). Used when `list` is absent. |
| `zone`, `base`, `name` | string | | Canon parts of a single entry, used when `list` and `entity` are absent. |
| `fields` | array of strings | | Field names recorded with the single entry. |

Each element of `list` is one of:

* a canon string, such as `'shop/product'`;
* an object with an `entity` canon string and optional `fields`:
  `{ entity: 'shop/product', fields: ['name', 'price'] }`;
* an entity, such as `seneca.make('shop/product')`: its canon is used,
  and no fields are recorded;
* any other object: its `zone`, `base` and `name` select the
  definition, and a new definition stores all of the object's
  properties (such as `fields`);
* any other value: an entry without zone, base or name.

For each entry the action loads a `sys/entity` with the entry's `zone`,
`base` and `name`. Parts that the entry leaves out are not part of the
query, so the entry `'product'` matches an existing `shop/product`
definition. When no definition matches, the action creates one from the
entry and saves it. When one matches it is replied as it is, except
that a missing `fields` property is set to `[]` and saved; an existing
definition is not updated with new fields. An entry without zone, base
and name (an empty message, or a value that is neither a string nor an
object) matches nothing and creates a new empty definition on every
call. Up to `limit.parallel` entries (default 11, see
[Options](options.md)) are processed at the same time.

Reply: an array with one `sys/entity` entity per entry, in entry order.
Each has the properties `zone`, `base` and `name` (parts that are not
set are omitted), `fields` and `id`.

Errors: a `load$` or `save$` error from the store is replied, and no
further entries are started; `RangeError: concurrency limit cannot be
less than 1` when `limit.parallel` is 0 or less; `action_timeout` when
`limit.parallel` is not a number (see [Options](options.md)); a
`TypeError` when seneca-entity is not loaded or an entry is `null`.

### Ensure entity

Pattern: `role:basic,cmd:ensure_entity`

Wraps the actions matching `pin` so that message properties holding
entity ids or entity data (objects with `entity$`) are replaced by
entities before the action runs.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `pin` | string, object or array of these | Required. The pattern or patterns of the actions to wrap. Every action that `seneca.list(pin)` returns (actions whose pattern contains the pin's properties) gets a wrapper. |
| `entmap` | object | Required. Maps message property names to entities, usually created with `seneca.make('zone/base/name')`. The entity's `load$` and `make$` methods are used. |

Validation: on Seneca 3.38 and Seneca 4 a message without `pin`,
without `entmap`, or with an `entmap` that is not an object is rejected
with the Seneca error `act_invalid_msg`. The rules are Gubu shapes built
with `seneca.util.Gubu`. Seneca releases that do not provide
`seneca.util.Gubu` get the rule objects of version 1.0.0
(`pin: { required$: true }`, `entmap: { object$: true, required$: true }`)
instead.

Reply: none (`null`). The wrappers are in place when the reply arrives.

Each time a wrapped action is called, the wrapper goes through the
property names of `entmap` in key order and looks at the message
property with that name:

* a string is treated as an id: `entmap[name].load$(id)` replaces the
  property with the loaded entity, or with `null` when no entity has
  that id;
* an object with an `entity$` property, or with the legacy `$`
  property, is replaced with `entmap[name].make$(object)`: an entity
  holding the object's data. A string `entity$` selects the canon, as it
  does for `seneca.make$`, so give the canon of the entmap entity (for
  example `'-/shop/product'`); with the `$` marker the canon of the
  entmap entity is used and `$` is dropped from the data;
* anything else (a missing property, a number, a plain object without
  `entity$` or `$`) is left unchanged.

The original action then runs with the modified message (through
`seneca.prior`). A `load$` error is replied by the wrapped action.

Actions added after `ensure_entity` was called are not wrapped, and
calling `ensure_entity` again for the same pin adds another layer of
wrappers.

## Legacy role:util patterns

Earlier versions used `role:util`. Every pattern still exists under that
role and runs the same code; the note patterns share the stores with
their `role:basic` counterparts.

| Legacy pattern | Same as | Deprecation notice |
| -------------- | ------- | ------------------ |
| `role:util,note:true,cmd:set` | `role:basic,note:true,cmd:set` | yes |
| `role:util,note:true,cmd:get` | `role:basic,note:true,cmd:get` | yes |
| `role:util,note:true,cmd:list` | `role:basic,note:true,cmd:list` | yes |
| `role:util,note:true,cmd:push` | `role:basic,note:true,cmd:push` | yes |
| `role:util,note:true,cmd:pop` | `role:basic,note:true,cmd:pop` | yes |
| `role:util,cmd:quickcode` | `role:basic,cmd:quickcode` | yes |
| `role:util,cmd:generate_id` | `role:basic,cmd:generate_id` | no |
| `role:util,cmd:ensure_entity` | `role:basic,cmd:ensure_entity` | no, and no message validation |
| `role:util,cmd:define_sys_entity` | `role:basic,cmd:define_sys_entity` | no |

The notice is the `deprecate$` directive
`role:util patterns are replaced by role:basic` on the pattern. Seneca
logs a `WARN` entry of kind `act`, case `DEPRECATED`, with this notice
on each call while `debug.deprecation` is true (the default). Use the
`role:basic` patterns in new code.
