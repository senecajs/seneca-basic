![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] data storage plugin

# seneca-basic 
[![Build Status][travis-badge]][travis-url]
[![Gitter chat][gitter-badge]][gitter-url]

[![js-standard-style][standard-badge]][standard-style]

This plugin is included with the main seneca module and provides a
small set of basic utility action patterns.

- __Version:__ 0.3.0
- __Tested on:__ [Seneca](//github.com/rjrodger/seneca) 0.7.2
- __Node:__ 0.10, 0.12, 4

If you're using this module, and need help, you can:

- Post a [github issue](//github.com/rjrodger/seneca-basic/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter][gitter-url]

seneca-basic's source can be read in an annotated fashion by,
- running `npm run annotate`
- viewing [online](http://rjrodger.github.io/seneca-basic/doc/basic.html)

The annotated source can be found locally at [./doc/seneca-basic.html]().

## Install

To install, simply use npm. Remember you will need to install [Seneca.js] if you haven't already.

```
npm install seneca
npm install seneca-basic
```

## Test  

To run tests, simply use npm:

```sh
npm run test
```

## Action Patterns

### `role:basic, note:true, cmd:set`

Set a note value. Notes are a simple internal per-process
communication mechanism for plugins to exchange data. In particular,
plugins can set keyed values before the plugin that uses the data
reads it. See [seneca-admin](/rjrodger/seneca-admin) for an example.

_Parameters_
 
   * `key`:   string; key name
   * `value`: key value

_Response:_

   * None.


### `role:basic, note:true, cmd:get`

Get a note value.

_Parameters_
 
   * `key`:   string; key name

_Response:_

   * `value`: key value, if defined


### `role:basic, note:true, cmd:push`

Push a note value onto a list. The namespace for lists is separate
from the namespace for single values. The list is created if it does not exist.

_Parameters_
 
   * `key`: string; key name
   * `value`: value to append to list.

_Response:_

   * None.


### `role:basic, note:true, cmd:list`

Get the full list of values for the key, in pushed order.

_Parameters_
 
   * `key`: string; key name

_Response:_

   * Array of values.


### `role:basic, note:true, cmd:pop`

Get the last value of a list, and remove it from the list.

_Parameters_
 
   * `key`: string; key name

_Response:_

   * `value`: key value, if list was non-empty


## Contributing
The [Senecajs org][] encourage open participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in touch.

## License
Copyright Richard Rodger and other contributors 2015, Licensed under [MIT][].

[travis-badge]: https://travis-ci.org/senecajs/seneca-basic.svg?branch=master
[travis-url]: https://travis-ci.org/senecajs/seneca-basic
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[standard-badge]: https://raw.githubusercontent.com/feross/standard/master/badge.png
[standard-style]: https://github.com/feross/standard

[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[Seneca.js]: https://www.npmjs.com/package/seneca
[senecajs.org]: http://senecajs.org/
[github issue]: https://github.com/rjrodger/seneca-level-store/issues
[@senecajs]: http://twitter.com/senecajs