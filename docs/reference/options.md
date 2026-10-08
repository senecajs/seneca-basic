# Options

The plugin has one option. Pass options when loading the plugin:

```js
seneca.use("@seneca/basic", { limit: { parallel: 5 } });
```

or in the instance options under `plugin.basic`:

```js
Seneca({ plugin: { basic: { limit: { parallel: 5 } } } });
```

Both forms work on Seneca 3.38 and Seneca 4. A top level `basic`
property (`Seneca({ basic: { ... } })`) is rejected by the option
validation of both versions.

The options are merged over the defaults with `seneca.util.deepextend`.
The plugin defines no `defaults` shape, so unknown options are accepted
and ignored, and no type checks are made when the plugin loads.

| Option | Type | Default | Effect |
| ------ | ---- | ------- | ------ |
| `limit.parallel` | positive integer | `11` | How many entries `role:basic,cmd:define_sys_entity` loads and saves at the same time (see [Action patterns: Define system entity](messages.md#define-system-entity)). |

`limit.parallel` is passed to `mapLimit` of the
[async](https://caolan.github.io/async/v3/) module. A value of 0 or less
(also the string `'0'`) makes every `define_sys_entity` message fail
with `RangeError: concurrency limit cannot be less than 1`. A value that
does not compare as a number, such as `'abc'`, starts no entry at all, so
the message gets no reply and times out (`action_timeout`).
