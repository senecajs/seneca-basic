# @seneca/basic documentation

The documentation follows the [Diátaxis](https://diataxis.fr/)
structure: four sections with four different jobs. Start with the
tutorial if you are new to the plugin; use the how-to guides for
specific tasks; look things up in the reference; read the explanations
to understand the design.

The plugin provides in-memory notes that plugins share, random
identifiers and short codes, and two helpers for seneca-entity. It runs
on Seneca 3 (tested with 3.38) and Seneca 4; the pages say where the
versions differ.

## Tutorials

Learning oriented lessons that take you through building something,
step by step.

| Tutorial | What you build |
| -------- | -------------- |
| [Getting started](tutorials/getting-started.md) | A Seneca 4 program that shares notes, generates identifiers and codes, records entity definitions and loads entities for an action. |

The programs from the tutorial and the how-to guides are in
[examples](examples/README.md).

## How-to guides

Task oriented recipes for people who already know the basics.

| Guide | Covers |
| ----- | ------ |
| [Generate ids and short codes](how-to/generate-ids-and-short-codes.md) | `generate_id`, collision odds, `quickcode` with `length`, `alphabet` and `curses`, the deprecation warning, `seneca.util.Nid`, replacing the generator. |
| [Share notes between plugins](how-to/share-notes-between-plugins.md) | `set` and `get`, `push`, `pop` and `list`, reading notes during plugin initialization, key conventions. |
| [Define system entities](how-to/define-system-entities.md) | Recording zone, base, name and fields in `sys/entity`, the entry forms, reading the definitions, the parallel limit. |
| [Load entities for actions](how-to/load-entities-for-actions.md) | `ensure_entity`: turning ids and `entity$` objects in messages into entities before an action runs, unknown ids. |
| [Use with Seneca 3 and 4](how-to/use-with-seneca-3-and-4.md) | Peer range, plugin options, callbacks and promises, errors, `ready`, testing on both versions. |

## Reference

Information oriented descriptions of every part of the plugin.

| Reference | Describes |
| --------- | --------- |
| [Action patterns](reference/messages.md) | Every pattern with parameters, reply and errors, and the legacy `role:util` names. |
| [Options](reference/options.md) | `limit.parallel`, its default and effect. |
| [Exports and utility functions](reference/api.md) | Loading the plugin, `seneca.export('basic')`, `pathnorm`, `deepextend`, the plugin definition, errors. |

## Explanation

Understanding oriented discussions of how the plugin works and why.

| Explanation | Topic |
| ----------- | ----- |
| [What the basic plugin is for](explanation/what-basic-is-for.md) | Utilities as action patterns, notes as a start up coordination channel, identifiers, the relation to seneca-entity, limits. |
| [Seneca 3 and 4](explanation/seneca-3-and-4.md) | What changed between the Seneca versions and how the plugin handles each change. |

## Feature index

Every option, action pattern, export, hook and error of the plugin, with
the page that documents it. The plugin has no command line flags and
defines no error codes of its own.

| Feature | Kind | Documented in |
| ------- | ---- | ------------- |
| `limit.parallel` | option | [Options](reference/options.md) |
| `role:basic,note:true,cmd:set` | action pattern | [Action patterns: note set](reference/messages.md#note-set) |
| `role:basic,note:true,cmd:get` | action pattern | [Action patterns: note get](reference/messages.md#note-get) |
| `role:basic,note:true,cmd:push` | action pattern | [Action patterns: note push](reference/messages.md#note-push) |
| `role:basic,note:true,cmd:pop` | action pattern | [Action patterns: note pop](reference/messages.md#note-pop) |
| `role:basic,note:true,cmd:list` | action pattern | [Action patterns: note list](reference/messages.md#note-list) |
| `role:basic,cmd:generate_id` | action pattern | [Action patterns: Generate id](reference/messages.md#generate-id) |
| `role:basic,cmd:quickcode` | action pattern, deprecated | [Action patterns: Quickcode](reference/messages.md#quickcode) |
| `role:basic,cmd:define_sys_entity` | action pattern | [Action patterns: Define system entity](reference/messages.md#define-system-entity) |
| `role:basic,cmd:ensure_entity` | action pattern | [Action patterns: Ensure entity](reference/messages.md#ensure-entity) |
| `role:util,note:true,cmd:set`, `get`, `push`, `pop`, `list` | legacy action patterns with a deprecation notice | [Action patterns: Legacy role:util patterns](reference/messages.md#legacy-roleutil-patterns) |
| `role:util,cmd:quickcode` | legacy action pattern with a deprecation notice | [Action patterns: Legacy role:util patterns](reference/messages.md#legacy-roleutil-patterns) |
| `role:util,cmd:generate_id`, `role:util,cmd:define_sys_entity`, `role:util,cmd:ensure_entity` | legacy action patterns | [Action patterns: Legacy role:util patterns](reference/messages.md#legacy-roleutil-patterns) |
| `seneca.export('basic')` | export | [Exports and utility functions: Exports](reference/api.md#exports) |
| `seneca.export('util')` | export alias provided by Seneca | [Exports and utility functions: Exports](reference/api.md#exports) |
| `pathnorm(path)` | utility function | [Exports and utility functions: pathnorm](reference/api.md#pathnorm) |
| `deepextend(...objects)` | utility function | [Exports and utility functions: deepextend](reference/api.md#deepextend) |
| `preload` | plugin definition hook | [Exports and utility functions: Plugin definition](reference/api.md#plugin-definition) |
| `act_invalid_msg`, `action_timeout`, `RangeError`, `TypeError`, store errors | errors a message can produce | [Exports and utility functions: Errors](reference/api.md#errors) |

## Other documents

* [Change log](../CHANGES.md)
* [Code of conduct](../CODE_OF_CONDUCT.md)
* [License](../LICENSE)
