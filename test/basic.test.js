"use strict";

const Util = require("util");
const Assert = require("assert");

const Async = require("async");
const Lab = require("@hapi/lab");
const lab = (exports.lab = Lab.script());

const it = make_it(lab);

const Seneca = require("seneca");

const { Maintain } = require('@seneca/maintain')

require("events").EventEmitter.defaultMaxListeners = Infinity;

function createSeneca() {
  return Seneca()
    .test()
    .use("entity")
    .use("..");
}

lab.experiment("seneca.basic", function() {
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
        done();
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
        done();
      });
    });
  });

  it("note list empty", function(done) {
    var seneca = createSeneca();
    seneca.act("role:basic,note:true,cmd:list,key:name", function(err, value) {
      Assert.equal(err, null);
      Assert.ok(value);
      Assert.deepEqual(value, []);
      done();
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

            done();
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
      done
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
      done
    );
  });

  it("quickcode basic", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "quickcode" }, function(err, code) {
      Assert.ifError(err);
      Assert.ok(code);
      Assert.equal(code.length, 8);
      Assert.ok(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) == null);
      done();
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
      done();
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
        done();
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
      done();
    });
  });

  it("generate_id basic", function(done) {
    var seneca = createSeneca();
    seneca.act({ role: "basic", cmd: "generate_id" }, function(err, id) {
      Assert.ifError(err);
      Assert.ok(id);
      Assert.equal(id.length, 6);
      done();
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
      done();
    });
  });

  it("define_sys_entity with list", function(done) {
    var seneca = createSeneca();
    seneca.act(
      { role: "basic", cmd: "define_sys_entity", list: "entity" },
      function(err, resp) {
        Assert.ifError(err);
        Assert.ok(resp);
        done();
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
        done();
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
      done();
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
        done();
      }
    );
  });

  it("utilfuncs pathnorm empty path", function(done) {
    var seneca = createSeneca();
    var basic = seneca.export("basic");
    var path = basic.pathnorm("");
    Assert.ok(path);
    Assert.equal(path, ".");
    done();
  });

  it("utilfuncs pathnorm null path", function(done) {
    var seneca = createSeneca();
    var basic = seneca.export("basic");
    var path = basic.pathnorm(null);
    Assert.ok(path);
    Assert.equal(path, ".");
    done();
  });
});

function make_it(lab) {
  return function it(name, opts, func) {
    if ("function" === typeof opts) {
      func = opts;
      opts = {};
    }

    lab.it(
      name,
      opts,
      Util.promisify(function(x, fin) {
        func(fin);
      })
    );
  };
}

Maintain()
