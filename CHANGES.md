## 2.0.0 2026-11-20

First release as `@seneca/basic`. Versions up to 1.0.0 were published as
`seneca-basic`. 1.1.0 was not published: its changes, listed in the
1.1.0 entry below, are part of 2.0.0, among them the `ensure_entity`
fixes and its behaviour change.

* Seneca 4: the peer dependency is `seneca` `^4.0.0`. Seneca 3 users stay
  on `seneca-basic@1`.
* Renamed from `seneca-basic` to `@seneca/basic`. The plugin name stays
  `basic`.
* Node.js 24 or later (`engines.node` `>=24`).
* `@seneca/entity` `^29.0.0` is an optional peer dependency, needed only
  by `define_sys_entity` and `ensure_entity`. Seneca 4 cannot load
  `seneca-entity` 28.
* The `ensure_entity` message rules are built with `seneca.valid`
  instead of `seneca.util.Gubu` (B1, D2). The fallback to the rule
  objects of 1.0.0 for Seneca releases without `seneca.util.Gubu` is
  removed.
* Options are merged with `seneca.util.deep`, and the exported
  `deepextend` is `seneca.util.deep`, so the plugin no longer causes the
  `SENECA_DEP_UTIL_GUBU` and `SENECA_DEP_UTIL_DEEPEXTEND` warnings (D2).
* Tests load `@seneca/entity` by its full name and no longer use the
  deprecated `seneca.export('util')` alias. Development dependencies:
  `seneca` `^4.0.0` and `@seneca/entity` `^29.0.0`, which replaces
  `seneca-entity`.
* Documentation: "Use with Seneca 3 and 4" is replaced by "Upgrade to
  Seneca 4", and the explanation "Seneca 3 and 4" by "Seneca 4". The
  example `seneca-3-and-4.js` is removed. The examples load
  `@seneca/entity` and use `await seneca.ready()`.

## 1.1.0 2026-10-08

* Seneca 4 prerelease support. The plugin runs on Seneca 3 (tested with
  3.38) and on Seneca 4 (`seneca@4.0.0-rc5`, the development dependency,
  and the unreleased 4.0.0); the test suite passes on all three. The
  peer dependency range is `>=3 || >=4.0.0-rc5`.
* `role:basic,cmd:ensure_entity` works again:
  * Its message rules (`pin` required, `entmap` required and an object)
    are now Gubu shapes built with `seneca.util.Gubu`. The previous rule
    objects (`required$`, `object$`) were compiled by Seneca 3.38 and
    Seneca 4 as closed shapes that rejected every message with
    `act_invalid_msg`. Seneca releases without `seneca.util.Gubu` keep
    the previous rule objects.
  * The wrappers it adds iterate with `async.eachSeries` instead of
    `seneca.util.recurse`, which Seneca 4 does not provide.
  * Behaviour change: a message property named in `entmap` that holds a
    plain object without `entity$` or `$` now passes through unchanged.
    Before, the wrapped action never replied and the message timed out.
* The `lodash` runtime dependency is removed; the few helpers it
  provided are plain JavaScript now, with the same behaviour. `async`
  and `nid` stay.
* Tests run with the Node.js test runner (`node --test`) instead of
  @hapi/lab 22, and cover all action patterns, the legacy `role:util`
  patterns, the `limit.parallel` option and the exports. Every test
  closes its Seneca instance. `coveralls` and `.travis.yml` are removed;
  `npm run coverage` uses the Node.js test runner coverage report. The
  repository hygiene checks (@seneca/maintain 0.1) moved from `npm test`
  to `npm run maintain`. Node.js 24 and 22 are tested.
* devDependencies: `seneca@^4.0.0-rc5`, `seneca-entity@^28.1.0` (which
  brings seneca-mem-store), `@seneca/maintain@^0.1.0`.
* The GitHub Actions `build` workflow (Node.js 24 and 22) is delivered as
  `.patches/0001-ci-add-the-build-workflow.patch`, because workflow files
  need a GitHub scope the preparing session did not have.
* The package is published as `@seneca/basic` from this version;
  versions up to 1.0.0 were published as `seneca-basic`.
  `seneca.use('basic')` loads the plugin under either name. The package
  now includes `CHANGES.md` and the documentation (`docs/**/*.md`,
  `docs/examples/*.js`).
* Documentation reorganized under `docs/` following the Diátaxis
  structure: a tutorial and runnable example programs, how-to guides, a
  reference for every action pattern, option, export and error, and
  explanations of the design and of the Seneca 3 and 4 differences. The
  README is a landing page.

## 0.5.0 25-08-2016

* Removed seneca-chain dependency PR#16
* Updated dependencies
* Added Seneca 3 and Node 6 support
* Dropped Node 0.10, 0.12, 5 support
