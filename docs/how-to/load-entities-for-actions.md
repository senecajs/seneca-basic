# Load entities for actions

Goal: let callers pass an entity id, or the entity's data as a plain
object, in a message property, and have the action receive an entity.
Callers on the other side of a network transport can send only such
JSON values, not entity objects.

`role:basic,cmd:ensure_entity` wraps the actions you name and converts
the properties before each call. The parameters and the exact rules are
in [Action patterns: Ensure entity](../reference/messages.md#ensure-entity).
The complete program is
[docs/examples/load-entities.js](../examples/load-entities.js).

## 1. Set up the instance

```js
const Seneca = require("seneca");

async function main() {
  const seneca = Seneca({ log: "silent" })
    .use("entity")
    .use("@seneca/basic");

  try {
    await new Promise(resolve => seneca.ready(resolve));

    // the code of the next steps goes here
  } finally {
    await seneca.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
```

The example turns logging off (`log: "silent"`) because it prints the
one expected error itself (step 5).

## 2. Write the action as if it always receives an entity

```js
seneca.add("role:shop,cmd:show", function(msg, reply) {
  const product = msg.product;
  if (null == product) return reply(new Error("product not found"));
  reply({ name: product.name, price: product.price, canon: product.entity$ });
});
```

The `null` check is for unknown ids (step 5).

## 3. Wrap the action

`pin` names the actions to wrap (a pattern string, a pattern object, or
an array of them). `entmap` maps message property names to entities;
each entity's `load$` and `make$` methods convert the property:

```js
await seneca.post("role:basic,cmd:ensure_entity", {
  pin: "role:shop,cmd:show",
  entmap: { product: seneca.make("shop/product") }
});
```

Add the actions before this message: actions added later are not
wrapped.

## 4. Call the action with an id or with data

```js
const apple = await seneca
  .entity("shop/product")
  .data$({ name: "apple", price: 1.5 })
  .save$();

// A string is an id: the entity is loaded from the store.
console.log(await seneca.post("role:shop,cmd:show", { product: apple.id }));

// An object with entity$ becomes an entity holding that data.
console.log(
  await seneca.post("role:shop,cmd:show", {
    product: { entity$: "-/shop/product", name: "pear", price: 2 }
  })
);

// A plain object without entity$ passes through unchanged.
console.log(
  await seneca.post("role:shop,cmd:show", {
    product: { name: "plum", price: 3 }
  })
);
```

Output:

```
{ name: 'apple', price: 1.5, canon: '-/shop/product' }
{ name: 'pear', price: 2, canon: '-/shop/product' }
{ name: 'plum', price: 3, canon: undefined }
```

Other values, such as a missing property or a number, also reach the
action unchanged.

## 5. Handle unknown ids

`load$` gives `null` for an id that does not exist, so the action
receives `null` and, in this example, replies an error:

```js
try {
  await seneca.post("role:shop,cmd:show", { product: "no-such-id" });
} catch (err) {
  console.log(err.message); // product not found
}
```

## Things to know

* The canon of an object with `entity$` comes from that `entity$`
  string, as with `seneca.make$`. Use the canon of the entmap entity
  (`'-/shop/product'`); an object with another canon becomes an entity
  of that other canon.
* The wrapper converts the properties in `entmap` one after the other,
  then calls the original action through `prior`. A `load$` error is
  replied as the action's error.
* The message must have `pin` and `entmap`, and `entmap` must be an
  object; otherwise Seneca 3.38 and Seneca 4 reply with an
  `act_invalid_msg` error. The legacy `role:util,cmd:ensure_entity`
  pattern has no validation.
* Sending `ensure_entity` twice for the same pin wraps the actions
  twice.
