/* Share settings between plugins with notes.
 * Run: node docs/examples/notes-between-plugins.js
 * Callbacks only, so the program runs on Seneca 3 and Seneca 4.
 */
"use strict";

const Seneca = require("seneca");

// Inside the plugin repository the plugin is loaded by path; in your own
// project write seneca.use("@seneca/basic").
const seneca = Seneca({ log: "warn" }).use(require("../.."));

// The first plugin records settings that later plugins need.
seneca.use(function settings() {
  this.act("role:basic,note:true,cmd:set", {
    key: "shop/currency",
    value: "EUR"
  });
  this.act("role:basic,note:true,cmd:push", {
    key: "shop/features",
    value: "carts"
  });
  this.act("role:basic,note:true,cmd:push", {
    key: "shop/features",
    value: "reviews"
  });
});

// A plugin loaded later reads the notes while it initializes.
seneca.use(function shop() {
  const seneca = this;
  let currency = "USD";
  let features = [];

  seneca.init(function(done) {
    seneca.act(
      "role:basic,note:true,cmd:get",
      { key: "shop/currency" },
      function(err, out) {
        if (err) return done(err);
        currency = out.value || currency;

        seneca.act(
          "role:basic,note:true,cmd:list",
          { key: "shop/features" },
          function(err, list) {
            if (err) return done(err);
            features = list;
            done();
          }
        );
      }
    );
  });

  seneca.add("role:shop,cmd:info", function(msg, reply) {
    reply({ currency: currency, features: features });
  });
});

seneca.ready(function() {
  seneca.act("role:shop,cmd:info", function(err, out) {
    if (err) return fail(err);
    console.log(out);
    seneca.close();
  });
});

// Close the instance on failure too, so that the process exits.
function fail(err) {
  console.error(err);
  process.exitCode = 1;
  seneca.close();
}
