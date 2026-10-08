# What the basic plugin is for

`@seneca/basic` is a small collection of utilities that Seneca
applications use from many plugins: shared notes, random identifiers,
and two helpers for entities. They are packaged as action patterns.
This page explains what that means, how the pieces work, and where their
limits are.

## Utilities as action patterns

Because the utilities are action patterns rather than functions, they
have the properties of any Seneca action:

* They are discoverable: `seneca.list('role:basic')` shows them.
* They can be replaced. A pattern added later for the same message
  becomes the implementation (see
  [Generate ids and short codes](../how-to/generate-ids-and-short-codes.md)),
  and it can call the earlier one with `this.prior`.
* They can be answered elsewhere. A message can be handled by another
  process over a transport without the caller changing.
* They are logged and traced like all other messages.

The price is a message round trip for what could be a function call.
The source keeps `TODO` notes saying that `generate_id` and
`ensure_entity` "should be a utility function, not a pattern". The
plugin does export two plain functions, `pathnorm` and `deepextend`,
through `seneca.export('basic')` (see
[Exports and utility functions](../reference/api.md)).

## Notes: values for plugins that load later

Plugins load one after another, and a plugin can only send messages to
patterns that already exist: a plugin loaded before the basic plugin
gets `act_not_found` for the note patterns. Once the basic plugin is
loaded, an early plugin can record a value and a plugin loaded later can
read it while it initializes. A comment in the source points to
seneca-admin, the Seneca administration plugin, as an example.

There are two stores: single values, where the latest `set` wins, and
lists, which grow with each `push`. A key can be used in both without
interference.

Notes live in the memory of the plugin instance, so they belong to one
Seneca instance in one process. There is no expiry, no persistence and
no replication, and `list` replies the stored array itself rather than a
copy. Values that several processes need belong in the configuration or
in entities.

## Identifiers

The identifiers come from [nid](https://www.npmjs.com/package/nid)
version 0.3, which draws random characters from an alphabet and rejects
results that contain a word from a curse list. nid describes itself as
a generator for identifiers that people see, such as short links.

Random ids are not unique by construction, unlike UUIDs. With the
default length of 6 characters a repeat becomes likely after tens of
thousands of ids (the numbers are in
[Generate ids and short codes](../how-to/generate-ids-and-short-codes.md#2-generate-an-id)).
`generate_id` caches one generator per length up to 64. `quickcode`,
the older pattern with a configurable alphabet and curse list, is marked
for removal and kept for compatibility.

## Relation to seneca-entity

The plugin does not depend on
[seneca-entity](https://github.com/senecajs/seneca-entity), but its two
entity patterns only make sense with it:

* `define_sys_entity` keeps a registry of the entities an application
  uses, as `sys/entity` entities with zone, base, name and fields, so
  that the application can describe itself to tools. It calls
  `seneca.make$` and `seneca.util.parsecanon`, which seneca-entity adds
  to the instance. A definition is written once: an existing definition
  is replied as it is and never updated by this pattern. Up to
  `limit.parallel` entries are processed at the same time, using the
  async module.
* `ensure_entity` works at the boundary between messages and entities.
  Messages often carry an entity's id or its data as JSON, in particular
  when they arrive over a network transport, while an action may need an
  entity with methods such as `save$`. `ensure_entity` uses
  `seneca.wrap` to add an override to each action that matches the pin.
  The override converts the message properties named in `entmap` (an id
  is loaded with `load$`, an object with `entity$` is turned into an
  entity with `make$`) and then calls the original action through
  `prior`.

## The legacy role:util patterns

The patterns were first published under `role:util`; the `role:basic`
names came later (the 0.3.0 release in 2015 normalized the note
patterns), and the Seneca core still maps `seneca.export('util')` to
`seneca.export('basic')`. The `role:util` patterns remain so that old
callers keep working. The note and quickcode variants carry a
deprecation notice, so Seneca logs a warning on each call and such
callers can be found.

## Limits

* Notes are in memory and per instance.
* Ids are random, not unique.
* `define_sys_entity` never updates an existing definition.
* `ensure_entity` wraps the actions that exist when it is called, and
  only those.
* `role:basic,cmd:quickcode` is deprecated, and a curse rule that
  rejects every code makes it loop forever.
