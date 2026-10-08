# Getting started

In this tutorial you load the plugin into a Seneca 4 instance, share
notes between parts of an application, generate identifiers and short
codes, record which entities the application uses, and let the plugin
load entities for an action. It takes about fifteen minutes. The
finished program is
[docs/examples/getting-started.js](../examples/getting-started.js).

## 1. Install

Seneca 4 needs Node.js 22 or later (24 is recommended). In a new
directory:

```sh
npm init -y
npm install seneca@^4.0.0-rc5 seneca-entity @seneca/basic
```

`seneca@^4.0.0-rc5` installs the Seneca 4 prerelease, and Seneca 4.0.0
once it is published. `seneca-entity` is needed for steps 5 and 6 only.

## 2. Create the instance

Create `basic-demo.js`:

```js
const Seneca = require("seneca");

async function main() {
  const seneca = Seneca({ log: "warn", debug: { deprecation: false } })
    .use("entity")
    .use("@seneca/basic");

  try {
    await new Promise(resolve => seneca.ready(resolve));

    // the next steps go here
  } finally {
    await seneca.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
```

* `log: 'warn'` keeps the log quiet. `debug: { deprecation: false }`
  turns off the warning that Seneca logs for deprecated patterns; step 4
  calls one.
* `use('entity')` loads seneca-entity, which brings an in-memory store.
  `use('@seneca/basic')` loads this plugin; its plugin name is `basic`,
  so `use('basic')` works too.
* `seneca.ready(resolve)` waits until the plugins are loaded. The
  callback form is used because `await seneca.ready()` does not resolve
  on an idle instance in Seneca 4.0.0-rc5.
* `finally` closes the instance on success and on failure, so that the
  process exits.

Run it with `node basic-demo.js`. It prints nothing and exits.

## 3. Share notes

Notes are small values that the plugin keeps in memory. Plugins loaded
later can read what earlier plugins recorded. Add inside the `try`
block:

```js
await seneca.post("role:basic,note:true,cmd:set,key:currency,value:EUR");
await seneca.post("role:basic,note:true,cmd:push,key:features,value:carts");
await seneca.post("role:basic,note:true,cmd:push,key:features,value:reviews");

console.log(await seneca.post("role:basic,note:true,cmd:get,key:currency"));
console.log(await seneca.post("role:basic,note:true,cmd:list,key:features"));
console.log(await seneca.post("role:basic,note:true,cmd:pop,key:features"));
console.log(await seneca.post("role:basic,note:true,cmd:list,key:features"));
```

Output:

```
{ value: 'EUR' }
[ 'carts', 'reviews' ]
{ value: 'reviews' }
[ 'carts' ]
```

`set` and `get` work on single values: `get` replies `{ value }`.
`push`, `list` and `pop` work on lists: `list` replies the array of
pushed values and `pop` removes and replies the last one. The two
stores are separate, so a key can hold a value and a list at the same
time. `seneca.post` is the promise form of `act`, built into Seneca 4.

## 4. Generate identifiers and short codes

```js
console.log(await seneca.post("role:basic,cmd:generate_id"));
console.log(await seneca.post("role:basic,cmd:generate_id,length:12"));
console.log(
  await seneca.post("role:basic,cmd:quickcode", {
    length: 6,
    alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  })
);
```

Output (your values differ, the ids are random):

```
mcwbb4
ma4d6j7mvpzs
5PJRH8
```

`generate_id` replies a string of lower case letters and digits, 6
characters long by default. `quickcode` accepts a custom alphabet and a
curse list, and is deprecated: that is the warning that step 2 turned
off. Both replies are plain strings, not objects.

## 5. Record entity definitions

`define_sys_entity` records the entities an application uses in the
`sys/entity` collection, so that tools can list them:

```js
const definitions = await seneca.post("role:basic,cmd:define_sys_entity", {
  list: [{ entity: "shop/product", fields: ["name", "price"] }, "shop/order"]
});
console.log(definitions);
```

Output:

```
[
  Entity {
    'entity$': '-/sys/entity',
    base: 'shop',
    name: 'product',
    fields: [ 'name', 'price' ],
    id: 'nlzjgo'
  },
  Entity {
    'entity$': '-/sys/entity',
    base: 'shop',
    name: 'order',
    fields: [],
    id: 'yd4d3s'
  }
]
```

Each entry is a canon string (`shop/order`) or an object with an
`entity` canon string and `fields`. The reply holds one `sys/entity`
entity per entry. Running the message again replies the existing
definitions instead of creating new ones.

## 6. Load entities for an action

An action often needs an entity, but a caller, in particular one on the
other side of a network transport, can only send the entity's id or its
data. `ensure_entity` wraps actions so that such properties arrive as
entities. First add an action that expects a `product` entity:

```js
seneca.add("role:shop,cmd:show", function(msg, reply) {
  const product = msg.product;
  reply({ name: product.name, price: product.price, canon: product.entity$ });
});
```

Then wrap it. `pin` names the actions to wrap, `entmap` says which
message properties hold entities and of which kind:

```js
await seneca.post("role:basic,cmd:ensure_entity", {
  pin: "role:shop,cmd:show",
  entmap: { product: seneca.make("shop/product") }
});
```

Now save a product and call the action twice, with an id and with plain
data:

```js
const apple = await seneca
  .entity("shop/product")
  .data$({ name: "apple", price: 1.5 })
  .save$();

console.log(await seneca.post("role:shop,cmd:show", { product: apple.id }));

console.log(
  await seneca.post("role:shop,cmd:show", {
    product: { entity$: "-/shop/product", name: "pear", price: 2 }
  })
);
```

Output:

```
{ name: 'apple', price: 1.5, canon: '-/shop/product' }
{ name: 'pear', price: 2, canon: '-/shop/product' }
```

For the first call the wrapper saw a string, treated it as an id and
loaded the entity. For the second it saw an object with `entity$` and
turned it into an entity. The action itself did not change.
`seneca.entity(canon)` creates an entity whose `save$` returns a promise
when it is called without a callback; entities from `seneca.make` and
from `seneca.entity` both work in `entmap`.

## 7. Run the finished program

```sh
node docs/examples/getting-started.js
```

```
{ value: 'EUR' }
[ 'carts', 'reviews' ]
{ value: 'reviews' }
[ 'carts' ]
mcwbb4
ma4d6j7mvpzs
5PJRH8
[
  Entity {
    'entity$': '-/sys/entity',
    base: 'shop',
    name: 'product',
    fields: [ 'name', 'price' ],
    id: 'nlzjgo'
  },
  Entity {
    'entity$': '-/sys/entity',
    base: 'shop',
    name: 'order',
    fields: [],
    id: 'yd4d3s'
  }
]
{ name: 'apple', price: 1.5, canon: '-/shop/product' }
{ name: 'pear', price: 2, canon: '-/shop/product' }
```

The program in the repository loads the plugin with `require("../..")`
instead of `use("@seneca/basic")` because it runs from inside the
plugin's own source tree.

## Next steps

* [Share notes between plugins](../how-to/share-notes-between-plugins.md)
  shows the notes in their natural place: plugin start up, with
  callbacks that also run on Seneca 3.
* [Generate ids and short codes](../how-to/generate-ids-and-short-codes.md),
  [Define system entities](../how-to/define-system-entities.md) and
  [Load entities for actions](../how-to/load-entities-for-actions.md)
  go deeper into each feature.
* [Use with Seneca 3 and 4](../how-to/use-with-seneca-3-and-4.md) lists
  what to do when the same code must run on both versions.
* The [Action patterns](../reference/messages.md) reference has every
  parameter and reply.
