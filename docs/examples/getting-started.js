/* Getting started with @seneca/basic on Seneca 4.
 * Run: node docs/examples/getting-started.js
 * The program is explained in docs/tutorials/getting-started.md.
 */
"use strict";

const Seneca = require("seneca");

async function main() {
  const seneca = Seneca({ log: "warn", debug: { deprecation: false } })
    // seneca-entity is needed only by define_sys_entity and ensure_entity.
    .use("entity")
    // This file lives inside the plugin repository. In your own project
    // write seneca.use("@seneca/basic") to load the installed package.
    .use(require("../.."));

  try {
    // The callback form of ready works on every Seneca 4 prerelease.
    await new Promise(resolve => seneca.ready(resolve));

    // 1. Notes: small values shared between plugins.
    await seneca.post("role:basic,note:true,cmd:set,key:currency,value:EUR");
    await seneca.post("role:basic,note:true,cmd:push,key:features,value:carts");
    await seneca.post(
      "role:basic,note:true,cmd:push,key:features,value:reviews"
    );

    console.log(await seneca.post("role:basic,note:true,cmd:get,key:currency"));
    console.log(
      await seneca.post("role:basic,note:true,cmd:list,key:features")
    );
    console.log(await seneca.post("role:basic,note:true,cmd:pop,key:features"));
    console.log(
      await seneca.post("role:basic,note:true,cmd:list,key:features")
    );

    // 2. Identifiers and short codes.
    console.log(await seneca.post("role:basic,cmd:generate_id"));
    console.log(await seneca.post("role:basic,cmd:generate_id,length:12"));
    console.log(
      await seneca.post("role:basic,cmd:quickcode", {
        length: 6,
        alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
      })
    );

    // 3. Record which entities the application uses.
    const definitions = await seneca.post("role:basic,cmd:define_sys_entity", {
      list: [
        { entity: "shop/product", fields: ["name", "price"] },
        "shop/order"
      ]
    });
    console.log(definitions);

    // 4. Load the entities named in a message before the action runs.
    seneca.add("role:shop,cmd:show", function(msg, reply) {
      const product = msg.product;
      reply({
        name: product.name,
        price: product.price,
        canon: product.entity$
      });
    });

    await seneca.post("role:basic,cmd:ensure_entity", {
      pin: "role:shop,cmd:show",
      entmap: { product: seneca.make("shop/product") }
    });

    const apple = await seneca
      .entity("shop/product")
      .data$({ name: "apple", price: 1.5 })
      .save$();

    // A string is an id: the entity is loaded.
    console.log(await seneca.post("role:shop,cmd:show", { product: apple.id }));

    // An object with entity$ becomes an entity.
    console.log(
      await seneca.post("role:shop,cmd:show", {
        product: { entity$: "-/shop/product", name: "pear", price: 2 }
      })
    );
  } finally {
    // Close the instance on success and on failure.
    await seneca.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
