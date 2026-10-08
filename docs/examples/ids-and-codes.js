/* Generate ids and short codes.
 * Run: node docs/examples/ids-and-codes.js
 * The program is explained in docs/how-to/generate-ids-and-short-codes.md.
 */
"use strict";

const Crypto = require("crypto");
const Seneca = require("seneca");

async function main() {
  // debug.deprecation: false hides the warning that quickcode logs.
  const seneca = Seneca({ log: "warn", debug: { deprecation: false } })
    // Inside the plugin repository the plugin is loaded by path; in your
    // own project write .use("@seneca/basic").
    .use(require("../.."));

  try {
    await new Promise(resolve => seneca.ready(resolve));

    // Ids: lower case letters and digits, 6 characters by default.
    console.log(await seneca.post("role:basic,cmd:generate_id"));
    console.log(await seneca.post("role:basic,cmd:generate_id,length:12"));

    // A code from your own alphabet (no 0, O, 1 or I).
    console.log(
      await seneca.post("role:basic,cmd:quickcode", {
        length: 6,
        alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
      })
    );

    // Your own curse rule: digits only, never starting with 0.
    console.log(
      await seneca.post("role:basic,cmd:quickcode", {
        alphabet: "0123456789",
        curses: /^0/
      })
    );

    // nid directly, without a message: Seneca's own copy.
    const makeCode = seneca.util.Nid({
      length: 6,
      alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    });
    console.log(makeCode());

    // Replace the generator: the pattern added last is the one that runs.
    seneca.add("role:basic,cmd:generate_id", function(msg, reply) {
      reply(null, Crypto.randomUUID());
    });
    console.log(await seneca.post("role:basic,cmd:generate_id"));
  } finally {
    // Close the instance on success and on failure.
    await seneca.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
