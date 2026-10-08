# Generate ids and short codes

Goal: give records, links or vouchers short random identifiers from a
Seneca action, with control over length and characters.

The plugin has two patterns for this. `role:basic,cmd:generate_id` is
the one to use. `role:basic,cmd:quickcode` is older, accepts a custom
alphabet and curse list, and is deprecated. Both reply with a plain
string. The full parameter lists are in
[Action patterns: Identifiers](../reference/messages.md#identifiers).
The complete program is
[docs/examples/ids-and-codes.js](../examples/ids-and-codes.js); it uses
the promise API of Seneca 4 (see
[Use with Seneca 3 and 4](use-with-seneca-3-and-4.md) for Seneca 3).

## 1. Set up the instance

```js
const Seneca = require("seneca");

async function main() {
  const seneca = Seneca({ log: "warn", debug: { deprecation: false } }).use(
    "@seneca/basic"
  );

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

seneca-entity is not needed for identifiers. `debug.deprecation: false`
hides the warning that `quickcode` logs (step 4). The `finally` block
closes the instance on success and on failure.

## 2. Generate an id

```js
console.log(await seneca.post("role:basic,cmd:generate_id"));
console.log(await seneca.post("role:basic,cmd:generate_id,length:12"));
```

Output (the ids are random, yours differ):

```
4ly5zh
8js5ioi3hv7s
```

Ids use the 36 characters `0-9` and `a-z`, and never contain one of
nid's built in curse words. The default length is 6.

Ids are random, not unique by construction. A 6 character id has 36^6
(about 2.2 billion) possible values, so among about 55,000 ids the
chance of a repeat is already one in two. With 12 characters that point
is reached at about 2.6 billion ids. Use a longer id, or check for an
existing record before you store a new one, when collisions matter.

## 3. Generate a code with your own alphabet or curse rule

`quickcode` takes `length`, `alphabet` and `curses`. This code uses
upper case letters and digits without the easily confused `0`, `O`,
`1` and `I`:

```js
console.log(
  await seneca.post("role:basic,cmd:quickcode", {
    length: 6,
    alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  })
);
// GR7QLY
```

`curses` replaces the built in curse list. It can be a regular
expression (codes that match are rejected), a function (return `true` to
reject a code), an array of strings, or a comma separated string. This
code has 8 digits and never starts with 0:

```js
console.log(
  await seneca.post("role:basic,cmd:quickcode", {
    alphabet: "0123456789",
    curses: /^0/
  })
);
// 47299263
```

Write curse strings in lower case: nid lower cases the code, but not
the curse words, before it compares them.

## 4. Deal with the quickcode deprecation warning

Every `quickcode` call logs a warning while the Seneca option
`debug.deprecation` is true (the default). In test mode
(`Seneca().test()`) the log line is:

```
62/3k/- WARN	act/DEPRECATED	{role:'basic',cmd:'quickcode'}	marked for removal in future
```

You have three choices:

* Use `generate_id` when the default alphabet is good enough.
* Call nid without a message. Seneca 3.38 and Seneca 4 expose their own
  copy as `seneca.util.Nid`:

  ```js
  const makeCode = seneca.util.Nid({
    length: 6,
    alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  });
  console.log(makeCode()); // 6QKJSE
  ```

* Turn off deprecation warnings for the whole instance with
  `debug: { deprecation: false }`, as in step 1. This also hides the
  warnings of other deprecated patterns.

## 5. Replace the generator

The generators are action patterns, so an application can replace
them. The pattern added last is the one that runs, and it can still call
the original with `this.prior`:

```js
const Crypto = require("crypto");

seneca.add("role:basic,cmd:generate_id", function(msg, reply) {
  reply(null, Crypto.randomUUID());
});

console.log(await seneca.post("role:basic,cmd:generate_id"));
// d2e2e9e4-3fda-423e-b635-ebc560591368
```

Every caller of `role:basic,cmd:generate_id` in this instance now
receives a UUID.
