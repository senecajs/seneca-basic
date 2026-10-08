"use strict";

// Repository hygiene checks from @seneca/maintain. Run with
// `npm run maintain`. They are not part of `npm test` because the
// default branch check (check_default expects `main`) cannot be
// satisfied from a pull request.

const { Maintain } = require("@seneca/maintain");

Maintain({ throwChecks: false })
  .then(function(results) {
    var failed = 0;

    Object.keys(results).forEach(function(name) {
      var result = results[name];
      if (!result.pass) failed++;
      console.log(
        (result.pass ? "pass  " : "FAIL  ") +
          name +
          (result.pass ? "" : "  (" + result.why.replace(/__/g, " ") + ")")
      );
    });

    console.log(failed ? failed + " check(s) failed" : "all checks passed");
    process.exitCode = failed ? 1 : 0;
  })
  .catch(function(err) {
    console.error(err);
    process.exitCode = 1;
  });
