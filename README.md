![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] plugin

# @seneca/basic

# @seneca/basic

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |

[![npm version][npm-badge]][npm-url]
[![Dependency Status][david-badge]][david-url]
[![Build Status][travis-badge]][travis-url]
[![Coveralls][badgecoveralls]][coveralls]
[![Gitter chat][gitter-badge]][gitter-url]

This plugin is included with the main seneca module and provides a
small set of basic utility action patterns.

If you're using this module, and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-basic/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter][gitter-url]

seneca-basic's source can be read in an annotated fashion by,

- running `npm run annotate`
- viewing [online](http://senecajs.github.io/seneca-basic/doc/basic.html)

The annotated source can be found locally at [./doc/seneca-basic.html](./doc/basic.html).

### Seneca compatibility

Supports Seneca versions **1.x** - **3.x**

## Install

This plugin module is included in the main Seneca module.

```sh
npm install seneca
```

### Explicit install

To explicitly install separately,

```sh
npm install seneca-basic
```

And in your code:

```js
var seneca = require('seneca')({
  default_plugins: {
    basic: false,
  },
})

seneca.use(require('seneca-basic'))
```

## Quick Example



## More Examples

See [test/](test/) for usage examples.

## Motivation



## Support

If you're using this module and need help, you can:

- Post a [github issue][]
- Tweet to [@senecajs][]

## API

### Releases

- 0.3.0: 2015-06-15: Normalized _note_ patterns. Prep for Seneca 0.6.2.

## Contributing

The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

The [Senecajs org][] encourage open participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in touch.

### Test

To run tests, simply use npm:

```sh
npm run test
```

## Background

### License

Copyright (c) 2014 - 2016, Richard Rodger and other contributors.
Licensed under [MIT][].

[travis-badge]: https://travis-ci.org/senecajs/seneca-basic.svg?branch=master
[travis-url]: https://travis-ci.org/senecajs/seneca-basic
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[npm-badge]: https://img.shields.io/npm/v/seneca-basic.svg
[npm-url]: https://npmjs.com/package/seneca-basic
[david-badge]: https://david-dm.org/senecajs/seneca-basic.svg
[david-url]: https://david-dm.org/senecajs/seneca-basic
[coveralls]: https://coveralls.io/github/senecajs/seneca-basic?branch=master
[badgecoveralls]: https://coveralls.io/repos/github/senecajs/seneca-basic/badge.svg?branch=master
[mit]: ./LICENSE
[senecajs org]: https://github.com/senecajs/
[seneca.js]: https://www.npmjs.com/package/seneca
[senecajs.org]: http://senecajs.org/
[github issue]: https://github.com/senecajs/seneca-basic/issues
[@senecajs]: http://twitter.com/senecajs
[seneca-admin]: https://github.com/senecajs/seneca-admin

[![npm version][npm-badge]][npm-url]
[![Dependency Status][david-badge]][david-url]
[![Build Status][travis-badge]][travis-url]
[![Coveralls][badgecoveralls]][coveralls]
[![Gitter chat][gitter-badge]][gitter-url]
[travis-badge]: https://travis-ci.org/senecajs/seneca-basic.svg?branch=master
[travis-url]: https://travis-ci.org/senecajs/seneca-basic
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[npm-badge]: https://img.shields.io/npm/v/seneca-basic.svg
[npm-url]: https://npmjs.com/package/seneca-basic
[david-badge]: https://david-dm.org/senecajs/seneca-basic.svg
[david-url]: https://david-dm.org/senecajs/seneca-basic
[coveralls]: https://coveralls.io/github/senecajs/seneca-basic?branch=master
[badgecoveralls]: https://coveralls.io/repos/github/senecajs/seneca-basic/badge.svg?branch=master
[mit]: ./LICENSE
[senecajs org]: https://github.com/senecajs/
[seneca.js]: https://www.npmjs.com/package/seneca
[senecajs.org]: http://senecajs.org/
[github issue]: https://github.com/senecajs/seneca-basic/issues
[@senecajs]: http://twitter.com/senecajs
[seneca-admin]: https://github.com/senecajs/seneca-admin
