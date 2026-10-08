# Share notes between plugins

Goal: let a plugin that loads early record settings or registrations
that plugins loaded later can read, without a shared module or global
variables.

Notes are small values kept in memory by the basic plugin, per Seneca
instance. There are two stores: single values (`set` and `get`) and
lists (`push`, `pop` and `list`). The same key may be used in both
stores; they do not interfere. The patterns are described in
[Action patterns: Notes](../reference/messages.md#notes). The complete
program is
[docs/examples/notes-between-plugins.js](../examples/notes-between-plugins.js);
it runs on Seneca 3 and Seneca 4.

## 1. Load the basic plugin first

```js
const Seneca = require("seneca");

const seneca = Seneca({ log: "warn" }).use("@seneca/basic");
```

Only plugins loaded after the basic plugin can send it messages while
they load; a plugin loaded before it gets an `act_not_found` error.

## 2. Record notes in the first plugin

```js
seneca.use(function settings() {
  this.act("role:basic,note:true,cmd:set", {
    key: "shop/currency",
    value: "EUR"
  });
  this.act("role:basic,note:true,cmd:push", {
    key: "shop/features",
    value: "carts"
  });
  this.act("role:basic,note:true,cmd:push", {
    key: "shop/features",
    value: "reviews"
  });
});
```

`set` stores one value per key and replaces an earlier value. `push`
appends to a list, creating it on the first push. A prefix in the key
(`shop/`) keeps the notes of different plugins apart.

## 3. Read the notes in a later plugin

Read them in the plugin's `init` function, so that the plugin is ready
only once it has its settings:

```js
seneca.use(function shop() {
  const seneca = this;
  let currency = "USD";
  let features = [];

  seneca.init(function(done) {
    seneca.act("role:basic,note:true,cmd:get", { key: "shop/currency" }, function(
      err,
      out
    ) {
      if (err) return done(err);
      currency = out.value || currency;

      seneca.act(
        "role:basic,note:true,cmd:list",
        { key: "shop/features" },
        function(err, list) {
          if (err) return done(err);
          features = list;
          done();
        }
      );
    });
  });

  seneca.add("role:shop,cmd:info", function(msg, reply) {
    reply({ currency: currency, features: features });
  });
});
```

`get` replies `{ value }`; `value` is `undefined` when nothing was set,
which is why the code keeps its default in that case. `list` replies the
array of pushed values, `[]` when nothing was pushed.

## 4. Use the result

```js
seneca.ready(function() {
  seneca.act("role:shop,cmd:info", function(err, out) {
    if (err) return fail(err);
    console.log(out);
    seneca.close();
  });
});

function fail(err) {
  console.error(err);
  process.exitCode = 1;
  seneca.close();
}
```

Output:

```
{ currency: 'EUR', features: [ 'carts', 'reviews' ] }
```

## Things to know

* `pop` removes and replies the last pushed value as `{ value }`. On a
  key that was never pushed it fails with an error, so push first or
  check with `list`.
* Values can be anything. In a message string Jsonic parses them:
  `value:EUR` is the string `'EUR'` and `value:12` the number `12`. Pass
  the message, or its extra properties, as an object for structured
  values: `seneca.act('role:basic,note:true,cmd:set', { key: 'k', value: { a: 1 } }, cb)`.
* The stores live in the plugin instance. A second Seneca instance has
  its own notes, nothing is written to disk, and a restart starts empty.
  Notes are a coordination channel during start up, not a database or a
  cache; see
  [What the basic plugin is for](../explanation/what-basic-is-for.md).
* The legacy `role:util,note:true,...` patterns use the same stores and
  log a deprecation warning on each call.
