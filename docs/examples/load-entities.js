/* Load entities for an action with ensure_entity.
 * Run: node docs/examples/load-entities.js
 * The program is explained in docs/how-to/load-entities-for-actions.md.
 */
"use strict";

const Seneca = require("seneca");

async function main() {
  // log: "silent" because the program prints the expected error itself.
  const seneca = Seneca({ log: "silent" })
    .use("entity")
    // Inside the plugin repository the plugin is loaded by path; in your
    // own project write .use("@seneca/basic").
    .use(require("../.."));

  try {
    await new Promise(resolve => seneca.ready(resolve));

    // The action expects msg.product to be an entity (null for an
    // unknown id).
    seneca.add("role:shop,cmd:show", function(msg, reply) {
      const product = msg.product;
      if (null == product) return reply(new Error("product not found"));
      reply({
        name: product.name,
        price: product.price,
        canon: product.entity$
      });
    });

    // Wrap the action: msg.product is resolved as a shop/product entity.
    await seneca.post("role:basic,cmd:ensure_entity", {
      pin: "role:shop,cmd:show",
      entmap: { product: seneca.make("shop/product") }
    });

    const apple = await seneca
      .entity("shop/product")
      .data$({ name: "apple", price: 1.5 })
      .save$();

    // A string is an id: the entity is loaded from the store.
    console.log(await seneca.post("role:shop,cmd:show", { product: apple.id }));

    // An object with entity$ becomes an entity holding that data.
    console.log(
      await seneca.post("role:shop,cmd:show", {
        product: { entity$: "-/shop/product", name: "pear", price: 2 }
      })
    );

    // A plain object without entity$ passes through unchanged.
    console.log(
      await seneca.post("role:shop,cmd:show", {
        product: { name: "plum", price: 3 }
      })
    );

    // An unknown id loads null, and the action replies an error.
    try {
      await seneca.post("role:shop,cmd:show", { product: "no-such-id" });
    } catch (err) {
      console.log(err.message);
    }
  } finally {
    // Close the instance on success and on failure.
    await seneca.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
