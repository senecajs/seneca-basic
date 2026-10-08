"use strict";

const { describe, it: node_it } = require("node:test");
const Assert = require("assert");

const Async = require("async");
const Seneca = require("seneca");

const it = make_it();

function createSeneca(options) {
  return Seneca()
    .test()
    .use("entity")
    .use("..", options);
}

describe("seneca.basic", function() {
  it("note get", function(done) {
    var seneca = createSeneca();
    seneca.act("role:basic,note:true,cmd:set,key:name,value:app1", function(
      err
    ) {
      Assert.equal(err, null);
      seneca.act("role:basic,note:true,cmd:get,key:name", function(
        err,
        response
      ) {
        Assert.equal(err, null);
        Assert.ok(response);
        Assert.ok(response.value);
        Assert.equal(response.value, "app1");
        seneca.close(done);
      });
    });
  });

  it("note list", function(done) {
    var seneca = createSeneca();
    seneca.act("role:basic,note:true,cmd:push,key:name,value:app1", function(
      err
    ) {
      Assert.equal(err, null);
      seneca.act("role:basic,note:true,cmd:list,key:name", function(
        err,
        response
      ) {
        Assert.equal(err, null);
        Assert.ok(response);
        Assert.deepEqual(response, ["app1"]);
        seneca.close(done);
      });
    });
  });

  it("note list empty", function(done) {
    var seneca = createSeneca();
    seneca.act("role:basic,note:true,cmd:list,key:name", function(err, value) {
      Assert.equal(err, null);
      Assert.ok(value);
      Assert.deepEqual(value, []);
      seneca.close(done);
    });
  });

  it("note pop", function(done) {
    var seneca = createSeneca();
    seneca.act("role:basic,note:true,cmd:push,key:name,value:app1", function(
      err
    ) {
      Assert.equal(err, null);
      seneca.act("role:basic,note:true,cmd:list,key:name", function(
        err,
        response
      ) {
        Assert.equal(err, null);
        Assert.ok(response);
        Assert.deepEqual(response, ["app1"]);

        seneca.act("role:basic,note:true,cmd:pop,key:name", function(
          err,
          response
        ) {
          Assert.equal(err, null);
          Assert.ok(response);
          Assert.ok(response.value);
          Assert.equal(response.value, "app1");

          seneca.act("role:basic,note:true,cmd:list,key:name", function(
            err,
            response
          ) {
            Assert.equal(err, null);
            Assert.ok(response);
            Assert.deepEqual(response, []);

            seneca.close(done);
          });
        });
      });
    });
  });

  it("note list and values have different namespaces", function(done) {
    var seneca = createSeneca();
    Async.series(
      [
        function(next) {
          seneca.act("role:basic,note:true,cmd:push,key:name,value:1", function(
            err
          ) {
            Assert.equal(err, null);
            next();
          });
        },
        function(next) {
          seneca.act("role:basic,note:true,cmd:set,key:name,value:2", function(
            err
          ) {
            Assert.ok(!err);
            next();
          });
        },
        function(next) {
          seneca.act("role:basic,note:true,cmd:get,key:name", function(
            err,
            response
          ) {
            Assert.equal(err, null);
            Assert.ok(response);
            Assert.equal(response.value, "2");
            next();
          });
        },
        function(next) {
          seneca.act("role:basic,note:true,cmd:list,key:name", function(
            err,
            response
          ) {
            Assert.equal(err, null);
            Assert.ok(response);
            Assert.deepEqual(response, ["1"]);
            next();
          });
        }
      ],
      function(err) {
        seneca.close(function() {
          done(err);
        });
      }
    );
  });

  it("note push", function(done) {
    var seneca = createSeneca();
    Async.series(
      [
        function(next) {
          seneca.act("role:basic,note:true,cmd:push,key:k0,value:i0", function(
            err
          ) {
            Assert.equal(err, null);
            next();
          });
        },
        function(next) {
          seneca.act("role:basic,note:true,cmd:list,key:k0", function(
            err,
            out
          ) {
            Assert.equal(err, null);
            Assert.deepEqual(["i0"], out);
            next();
          });
        },
        function(next) {
          seneca.act("role:basic,note:true,cmd:push,key:k0,value:i1", function(
            err,
            response
          ) {
            Assert.equal(err, null);

            next();
          });
        },
        function(next) {
          seneca.act("role:basic,note:true,cmd:list,key:k0", function(
            err,
            out
          ) {
            Assert.equal(err, null);
            Assert.deepEqual(["i0", "i1"], out);

            next();
          });
        }
      ],
      function(err) {
        seneca.close(function() {
          done(err);
        });
      }
    );
  });

  it("note legacy role:util patterns share the store", function(done) {
    var seneca = createSeneca().quiet();
    seneca.act("role:util,note:true,cmd:set,key:name,value:app1", function(
      err
    ) {
      Assert.equal(err, null);
      seneca.act("role:util,note:true,cmd:push,key:name,value:v0", function(
        err
      ) {
        Assert.equal(err, null);
        seneca.act("role:basic,note:true,cmd:get,key:name", function(
          err,
          response
        ) {
          Assert.equal(err, null);
          Assert.equal(response.value, "app1");
          seneca.act("role:util,note:true,cmd:list,key:name", function(
            err,
            response
          ) {
            Assert.equal(err, null);
            Assert.deepEqual(response, ["v0"]);
            seneca.act("role:util,note:true,cmd:pop,key:name", function(
              err,
              response
            ) {
              Assert.equal(err, null);
              Assert.equal(response.value, "v0");
              seneca.close(done);
            });
          });
        });
      });
    });
  });

  it("quickcode basic", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "quickcode" }, function(err, code) {
      Assert.ifError(err);
      Assert.ok(code);
      Assert.equal(code.length, 8);
      Assert.ok(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) == null);
      seneca.close(done);
    });
  });

  it("quickcode basic with length", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "quickcode", length: 12 }, function(
      err,
      code
    ) {
      Assert.ifError(err);
      Assert.ok(code);
      Assert.equal(code.length, 12);
      Assert.ok(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) == null);
      seneca.close(done);
    });
  });

  it("quickcode basic with len alias", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "quickcode", len: "4" }, function(
      err,
      code
    ) {
      Assert.ifError(err);
      Assert.equal(code.length, 4);
      seneca.close(done);
    });
  });

  it("quickcode basic with alphabet", function(done) {
    var seneca = createSeneca();
    seneca.act(
      { role: "basic", cmd: "quickcode", alphabet: "abcdef" },
      function(err, code) {
        Assert.ifError(err);
        Assert.ok(code);
        Assert.equal(code.length, 8);
        Assert.ok(/[ABCDEF]/.exec(code) == null);
        Assert.ok(/^[abcdef]+$/.exec(code));
        seneca.close(done);
      }
    );
  });

  it("quickcode basic with curses", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "quickcode", curses: "damn" }, function(
      err,
      code
    ) {
      Assert.ifError(err);
      Assert.ok(code);
      Assert.equal(code.length, 8);
      Assert.ok(/[ABCDEF]/.exec(code) == null);
      seneca.close(done);
    });
  });

  it("quickcode legacy role:util", function(done) {
    var seneca = createSeneca().quiet();
    seneca.act({ role: "util", cmd: "quickcode", length: 5 }, function(
      err,
      code
    ) {
      Assert.ifError(err);
      Assert.equal(code.length, 5);
      seneca.close(done);
    });
  });

  it("generate_id basic", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "generate_id" }, function(err, id) {
      Assert.ifError(err);
      Assert.ok(id);
      Assert.equal(id.length, 6);
      seneca.close(done);
    });
  });

  it("generate_id with length", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "generate_id", length: 10 }, function(
      err,
      id
    ) {
      Assert.ifError(err);
      Assert.equal(id.length, 10);
      Assert.ok(/^[0-9a-z]+$/.exec(id));

      // lengths above 64 are not cached
      seneca.act({ role: "basic", cmd: "generate_id", length: 70 }, function(
        err,
        id
      ) {
        Assert.ifError(err);
        Assert.equal(id.length, 70);

        seneca.act({ role: "util", cmd: "generate_id" }, function(err, id) {
          Assert.ifError(err);
          Assert.equal(id.length, 6);
          seneca.close(done);
        });
      });
    });
  });

  it("define_sys_entity", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "define_sys_entity" }, function(
      err,
      resp
    ) {
      Assert.ifError(err);
      Assert.ok(resp);
      seneca.close(done);
    });
  });

  it("define_sys_entity with list", function(done) {
    var seneca = createSeneca();
    seneca.act(
      { role: "basic", cmd: "define_sys_entity", list: "entity" },
      function(err, resp) {
        Assert.ifError(err);
        Assert.ok(resp);
        seneca.close(done);
      }
    );
  });

  it("define_sys_entity with list and string entity", function(done) {
    var seneca = createSeneca();
    seneca.act(
      { role: "basic", cmd: "define_sys_entity", list: [{ entity: "ent" }] },
      function(err, resp) {
        Assert.ifError(err);
        Assert.ok(resp);
        seneca.close(done);
      }
    );
  });

  it("define_sys_entity with list and non object entity", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "define_sys_entity", list: [1] }, function(
      err,
      resp
    ) {
      Assert.ifError(err);
      Assert.ok(resp);
      seneca.close(done);
    });
  });

  it("define_sys_entity with list and a seneca entity", function(done) {
    var seneca = createSeneca();
    var product = seneca.make("product");
    seneca.act(
      { role: "basic", cmd: "define_sys_entity", list: [product] },
      function(err, resp) {
        Assert.ifError(err);
        Assert.ok(resp);
        seneca.close(done);
      }
    );
  });

  it("define_sys_entity records canon and fields once", function(done) {
    var seneca = createSeneca();
    seneca.act(
      {
        role: "basic",
        cmd: "define_sys_entity",
        list: "shop/product, sys/user"
      },
      function(err, first) {
        Assert.ifError(err);
        Assert.equal(first.length, 2);
        Assert.equal(first[0].base, "shop");
        Assert.equal(first[0].name, "product");
        Assert.deepEqual(first[0].fields, []);
        Assert.equal(first[1].base, "sys");
        Assert.equal(first[1].name, "user");

        seneca.act(
          {
            role: "basic",
            cmd: "define_sys_entity",
            entity: "shop/product",
            fields: ["name", "price"]
          },
          function(err, second) {
            Assert.ifError(err);
            Assert.equal(second.length, 1);

            // the existing definition is returned unchanged
            Assert.equal(second[0].id, first[0].id);
            Assert.deepEqual(second[0].fields, []);

            seneca.act(
              { role: "util", cmd: "define_sys_entity", name: "order" },
              function(err, third) {
                Assert.ifError(err);
                Assert.equal(third[0].name, "order");
                seneca.close(done);
              }
            );
          }
        );
      }
    );
  });

  it("define_sys_entity respects limit.parallel", function(done) {
    var seneca = createSeneca({ limit: { parallel: 1 } });
    seneca.act(
      { role: "basic", cmd: "define_sys_entity", list: ["a", "b", "c"] },
      function(err, resp) {
        Assert.ifError(err);
        Assert.deepEqual(
          resp.map(function(ent) {
            return ent.name;
          }),
          ["a", "b", "c"]
        );
        seneca.close(done);
      }
    );
  });

  it("define_sys_entity rejects an invalid limit.parallel", function(done) {
    var seneca = createSeneca({ limit: { parallel: 0 } }).quiet();
    seneca.act(
      { role: "basic", cmd: "define_sys_entity", list: ["a"] },
      function(err) {
        Assert.ok(err);
        Assert.ok(/concurrency limit cannot be less than 1/.test(err.message));
        seneca.close(done);
      }
    );
  });

  it("define_sys_entity replies with store errors", function(done) {
    var seneca = createSeneca().quiet();
    seneca.add("role:entity,cmd:load,base:sys,name:entity", function(
      msg,
      reply
    ) {
      reply(new Error("load failed"));
    });
    seneca.act(
      { role: "basic", cmd: "define_sys_entity", list: ["a", "b"] },
      function(err, resp) {
        Assert.ok(err);
        Assert.ok(/load failed/.test(err.message));
        Assert.equal(resp, null);
        seneca.close(done);
      }
    );
  });

  it("ensure_entity loads and makes entities for the wrapped actions", function(done) {
    var seneca = createSeneca();

    seneca.add("role:shop,cmd:show", function(msg, reply) {
      reply({
        is_entity: !!(msg.user && msg.user.entity$),
        name: msg.user && msg.user.name,
        id: msg.user && msg.user.id,
        other: msg.other
      });
    });

    seneca.act(
      {
        role: "basic",
        cmd: "ensure_entity",
        pin: "role:shop,cmd:show",
        entmap: { user: seneca.make("sys/user") }
      },
      function(err) {
        Assert.ifError(err);

        // JSON with entity$ becomes an entity
        seneca.act(
          "role:shop,cmd:show",
          { user: { name: "alice", entity$: "-/sys/user" } },
          function(err, out) {
            Assert.ifError(err);
            Assert.deepEqual(out, {
              is_entity: true,
              name: "alice",
              id: undefined,
              other: undefined
            });

            seneca.make("sys/user", { name: "bob" }).save$(function(err, bob) {
              Assert.ifError(err);

              // a string is an id and loads the entity
              seneca.act("role:shop,cmd:show", { user: bob.id }, function(
                err,
                out
              ) {
                Assert.ifError(err);
                Assert.equal(out.is_entity, true);
                Assert.equal(out.name, "bob");
                Assert.equal(out.id, bob.id);

                // other values pass through unchanged
                seneca.act(
                  "role:shop,cmd:show",
                  { user: { name: "plain" }, other: 1 },
                  function(err, out) {
                    Assert.ifError(err);
                    Assert.deepEqual(out, {
                      is_entity: false,
                      name: "plain",
                      id: undefined,
                      other: 1
                    });
                    seneca.close(done);
                  }
                );
              });
            });
          }
        );
      }
    );
  });

  it("ensure_entity requires pin and entmap", function(done) {
    var seneca = createSeneca().quiet();
    seneca.act({ role: "basic", cmd: "ensure_entity" }, function(err) {
      Assert.ok(err);
      Assert.equal(err.code, "act_invalid_msg");

      seneca.act(
        { role: "basic", cmd: "ensure_entity", pin: "a:1", entmap: "user" },
        function(err) {
          Assert.ok(err);
          Assert.equal(err.code, "act_invalid_msg");
          seneca.close(done);
        }
      );
    });
  });

  it("ensure_entity legacy role:util", function(done) {
    var seneca = createSeneca();

    seneca.add("role:shop,cmd:show", function(msg, reply) {
      reply({ name: msg.user.name, is_entity: !!msg.user.entity$ });
    });

    seneca.act(
      {
        role: "util",
        cmd: "ensure_entity",
        pin: { role: "shop", cmd: "show" },
        entmap: { user: seneca.make("sys/user") }
      },
      function(err) {
        Assert.ifError(err);
        seneca.act(
          "role:shop,cmd:show",
          { user: { name: "carol", entity$: "-/sys/user" } },
          function(err, out) {
            Assert.ifError(err);
            Assert.deepEqual(out, { name: "carol", is_entity: true });
            seneca.close(done);
          }
        );
      }
    );
  });

  it("utilfuncs pathnorm empty path", function(done) {
    var seneca = createSeneca();
    var basic = seneca.export("basic");
    var path = basic.pathnorm("");
    Assert.ok(path);
    Assert.equal(path, ".");
    seneca.close(done);
  });

  it("utilfuncs pathnorm null path", function(done) {
    var seneca = createSeneca();
    var basic = seneca.export("basic");
    var path = basic.pathnorm(null);
    Assert.ok(path);
    Assert.equal(path, ".");
    seneca.close(done);
  });

  it("utilfuncs pathnorm removes trailing slashes", function(done) {
    var seneca = createSeneca();
    var basic = seneca.export("basic");
    Assert.equal(basic.pathnorm("/a/b//"), "/a/b");
    Assert.equal(basic.pathnorm("a//b/../c/"), "a/c");
    Assert.equal(basic.pathnorm(123), "123");
    seneca.close(done);
  });

  it("utilfuncs deepextend and legacy util export", function(done) {
    var seneca = Seneca()
      .test()
      .use("..");
    var basic = seneca.export("basic");
    Assert.equal(typeof basic.deepextend, "function");
    Assert.deepEqual(basic.deepextend({ a: { b: 1 } }, { a: { c: 2 } }), {
      a: { b: 1, c: 2 }
    });
    Assert.equal(seneca.export("util"), basic);
    seneca.close(done);
  });
});

// Adapts the test signature `function (done)` to the node:test runner.
function make_it() {
  return function it(name, opts, func) {
    if ("function" === typeof opts) {
      func = opts;
      opts = {};
    }

    var options = Object.assign({ timeout: 11111 }, opts);

    return node_it(name, options, function(t, done) {
      func(done);
    });
  };
}
