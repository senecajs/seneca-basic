/* Define system entities.
 * Run: node docs/examples/system-entities.js
 * The program is explained in docs/how-to/define-system-entities.md.
 */
"use strict";

const Seneca = require("seneca");

async function main() {
  const seneca = Seneca({ log: "warn" })
    .use("entity")
    // Inside the plugin repository the plugin is loaded by path; in your
    // own project write .use("@seneca/basic").
    .use(require("../.."));

  try {
    await new Promise(resolve => seneca.ready(resolve));

    // Canon strings, as an array or as a comma separated string.
    const first = await seneca.post("role:basic,cmd:define_sys_entity", {
      list: "shop/order, shop/customer"
    });
    console.log(first);

    // Field names are recorded when a definition is created.
    const product = await seneca.post("role:basic,cmd:define_sys_entity", {
      list: [{ entity: "shop/product", fields: ["name", "price"] }]
    });
    console.log(product[0].fields);

    // Without list, the message itself describes one entry.
    const invoice = await seneca.post("role:basic,cmd:define_sys_entity", {
      entity: "shop/invoice",
      fields: ["total"]
    });
    console.log(invoice.length, invoice[0].name, invoice[0].fields);

    const supplier = await seneca.post(
      "role:basic,cmd:define_sys_entity,base:shop,name:supplier"
    );
    console.log(supplier[0].name);

    // An entity contributes its canon. The definition exists already,
    // so it is replied unchanged, without new fields.
    const again = await seneca.post("role:basic,cmd:define_sys_entity", {
      list: [seneca.make("shop/product")]
    });
    console.log(again[0].id === product[0].id, again[0].fields);

    // The definitions are ordinary sys/entity entities.
    const all = await seneca.entity("sys/entity").list$();
    console.log(
      all.map(
        def => def.base + "/" + def.name + " " + JSON.stringify(def.fields)
      )
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
