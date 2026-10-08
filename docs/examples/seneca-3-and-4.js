/* The same program on Seneca 3 and Seneca 4: callbacks only.
 * Run with the Seneca 4 prerelease (the development dependency):
 *   node docs/examples/seneca-3-and-4.js
 * Run with another Seneca installation:
 *   SENECA=/path/to/node_modules/seneca node docs/examples/seneca-3-and-4.js
 */
"use strict";

const Seneca = require(process.env.SENECA || "seneca");

// Inside the plugin repository the plugin is loaded by path; in your own
// project write seneca.use("@seneca/basic").
const seneca = Seneca({ log: "warn" }).use(require("../.."));

seneca.ready(function() {
  console.log("Seneca " + seneca.version);

  seneca.act("role:basic,note:true,cmd:set,key:mode,value:demo", function(err) {
    if (err) return fail(err);

    seneca.act("role:basic,note:true,cmd:get,key:mode", function(err, out) {
      if (err) return fail(err);
      console.log(out);

      seneca.act("role:basic,cmd:generate_id,length:8", function(err, id) {
        if (err) return fail(err);
        console.log(id.length + " character id");

        seneca.close(function() {
          console.log("closed");
        });
      });
    });
  });
});

// Close the instance on failure too, so that the process exits.
function fail(err) {
  console.error(err);
  process.exitCode = 1;
  seneca.close();
}
