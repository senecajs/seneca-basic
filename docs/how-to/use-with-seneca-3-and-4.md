# Use with Seneca 3 and 4

Goal: run an application or plugin that uses `@seneca/basic` on Seneca 3
(3.38) and on Seneca 4, from one code base.

Version 1.1 of the plugin supports both, and its test suite passes on
Seneca 3.38, 4.0.0-rc5 and 4.0.0. The differences between the Seneca
versions that matter for this plugin are explained in
[Seneca 3 and 4](../explanation/seneca-3-and-4.md); this guide lists
what to do.

## 1. Install

```sh
npm install @seneca/basic
```

The peer dependency range is `seneca >=3 || >=4.0.0-rc5`, so npm accepts
Seneca 3.x, the Seneca 4 prerelease and Seneca 4. Install seneca-entity
as well if you use the entity patterns.

## 2. Load and configure the plugin the same way

```js
const seneca = Seneca().use("@seneca/basic", { limit: { parallel: 5 } });
```

Options given to `use`, or in the instance options as
`Seneca({ plugin: { basic: { limit: { parallel: 5 } } } })`, work on both
versions. A top level `basic` property (`Seneca({ basic: {...} })`) is
rejected by the option validation of both versions.

## 3. Use callbacks, or promises on Seneca 4

The callback API (`act`, `ready(fn)`, `close(fn)`) is the same on both
versions:

```js
seneca.act("role:basic,cmd:generate_id,length:8", function(err, id) {
  if (err) return fail(err);
  console.log(id.length + " character id");
});
```

Seneca 4 has `seneca.post(msg)` and `seneca.message(pattern, asyncFn)`
built in. On Seneca 3, load
[seneca-promisify](https://github.com/senecajs/seneca-promisify) first
(`seneca.use("promisify")`) to get the same methods. `post` resolves to
the reply, so for `generate_id` and `quickcode` to the string, on either
version.

## 4. Read errors in a version independent way

On Seneca 4 the callback receives the original error. On Seneca 3 it
receives a Seneca error that wraps it, with the original in `err.orig`.
A `pop` on a list that was never pushed fails on both:

```js
seneca.act("role:basic,note:true,cmd:pop,key:never-pushed", function(err) {
  console.log(err.message);
  console.log((err.orig || err).message);
});
```

On Seneca 4 both lines print
`Cannot read properties of undefined (reading 'pop')`. On Seneca 3.38 the
first line is
`seneca: Action cmd:pop,note:true,role:basic failed: Cannot read properties of undefined (reading 'pop').`
and the second line is the original message.

Seneca's own error codes are in `err.code` on both versions, for example
`act_invalid_msg` when `ensure_entity` is sent without `pin`.

## 5. Wait for ready with a callback

`await seneca.ready()` does not resolve on an idle instance in Seneca
4.0.0-rc5 (fixed in 4.0.0) and needs seneca-promisify on Seneca 3. The
callback form works everywhere:

```js
await new Promise(function(resolve) {
  seneca.ready(resolve);
});
```

## 6. Run the same program on both versions

[docs/examples/seneca-3-and-4.js](../examples/seneca-3-and-4.js) uses
callbacks only and loads Seneca from the path in the `SENECA`
environment variable, or `seneca` by default:

```sh
node docs/examples/seneca-3-and-4.js
SENECA=/path/to/seneca3/node_modules/seneca node docs/examples/seneca-3-and-4.js
```

Output with the Seneca 4 prerelease, then with Seneca 3.38:

```
Seneca 4.0.0-rc5
{ value: 'demo' }
8 character id
closed
```

```
Seneca 3.38.0
{ value: 'demo' }
8 character id
closed
```

The program closes the instance on the failure path too, so that the
process always exits:

```js
function fail(err) {
  console.error(err);
  process.exitCode = 1;
  seneca.close();
}
```

## 7. Test against both versions

In a package that supports both, install Seneca 4 as the development
dependency and Seneca 3 under an npm alias, then run the tests twice:

```sh
npm install --save-dev seneca@^4.0.0-rc5 seneca3@npm:seneca@^3.38.0
```

```js
// SENECA=seneca3 npm test runs the tests on Seneca 3
const Seneca = require(process.env.SENECA || "seneca");
```

This repository does it more simply: `npm install --no-save seneca@3`,
`npm test`, then `npm install` to restore the development dependency.

Node.js: Seneca 4.0.0 requires Node.js 22 or later. The tests of this
plugin run on Node.js 24 and 22.
