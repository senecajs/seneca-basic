# Define system entities

Goal: record which entities an application uses, with their zone, base,
name and field names, in the `sys/entity` collection, so that tools such
as an administration interface can list them.

`role:basic,cmd:define_sys_entity` needs
[seneca-entity](https://github.com/senecajs/seneca-entity) and an entity
store. seneca-entity 28 includes seneca-mem-store and uses it when no
other store is loaded, which is enough to try the examples. The
parameters are listed in
[Action patterns: Define system entity](../reference/messages.md#define-system-entity).
The complete program is
[docs/examples/system-entities.js](../examples/system-entities.js).

## 1. Set up the instance

```js
const Seneca = require("seneca");

async function main() {
  const seneca = Seneca({ log: "warn" })
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

## 2. Define entities from canon strings

A canon string is `zone/base/name`, `base/name` or just `name`. Several
entries go in `list`, as an array or as a comma separated string:

```js
const first = await seneca.post("role:basic,cmd:define_sys_entity", {
  list: "shop/order, shop/customer"
});
console.log(first);
```

The reply is one `sys/entity` entity per entry, in entry order:

```
[
  Entity {
    'entity$': '-/sys/entity',
    base: 'shop',
    name: 'order',
    fields: [],
    id: 'odw4j9'
  },
  Entity {
    'entity$': '-/sys/entity',
    base: 'shop',
    name: 'customer',
    fields: [],
    id: 'gn134x'
  }
]
```

## 3. Record field names

Use the object form of an entry, with `entity` and `fields`:

```js
const product = await seneca.post("role:basic,cmd:define_sys_entity", {
  list: [{ entity: "shop/product", fields: ["name", "price"] }]
});
console.log(product[0].fields); // [ 'name', 'price' ]
```

Fields are recorded when a definition is created. Give them in the
first message that defines the entity: later messages reply the
existing definition as it is (step 5).

## 4. Define a single entity from the message

Without `list`, the message's own `entity` (or `zone`, `base` and
`name`) and `fields` properties describe one entry:

```js
const invoice = await seneca.post("role:basic,cmd:define_sys_entity", {
  entity: "shop/invoice",
  fields: ["total"]
});
console.log(invoice.length, invoice[0].name, invoice[0].fields);
// 1 invoice [ 'total' ]

const supplier = await seneca.post(
  "role:basic,cmd:define_sys_entity,base:shop,name:supplier"
);
console.log(supplier[0].name); // supplier
```

## 5. Pass entities instead of strings

An entity in `list` contributes its canon. `shop/product` was defined in
step 3, so its definition is replied unchanged:

```js
const again = await seneca.post("role:basic,cmd:define_sys_entity", {
  list: [seneca.make("shop/product")]
});
console.log(again[0].id === product[0].id, again[0].fields);
// true [ 'name', 'price' ]
```

## 6. Read the definitions

The definitions are ordinary `sys/entity` entities:

```js
const all = await seneca.entity("sys/entity").list$();
console.log(
  all.map(def => def.base + "/" + def.name + " " + JSON.stringify(def.fields))
);
```

Output:

```
[
  'shop/order []',
  'shop/customer []',
  'shop/product ["name","price"]',
  'shop/invoice ["total"]',
  'shop/supplier []'
]
```

With callbacks, which also work on Seneca 3, write
`seneca.make("sys/entity").list$({}, function (err, list) { ... })`.

## Things to know

* A definition is created once. To change the fields of an existing
  definition, load the `sys/entity` entity, change `fields` and save it
  with `save$`.
* Canon parts that an entry leaves out match anything: after step 3,
  defining `'product'` replies the `shop/product` definition instead of
  creating a new one. Give the full canon to keep definitions apart.
* An entry without zone, base and name, such as a message with no
  parameters, creates a new empty definition every time.
* Up to `limit.parallel` entries (default 11) are processed at the same
  time; see [Options](../reference/options.md). The reply keeps the
  order of the entries.
* A store error from `load$` or `save$` becomes the error of the whole
  message. Entries that were saved before the error stay saved.
* With a persistent store the definitions survive restarts; with
  seneca-mem-store they live as long as the process.
