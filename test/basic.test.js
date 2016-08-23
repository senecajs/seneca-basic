'use strict'

var Assert = require('assert')
var Async = require('async')
var Lab = require('lab')
var lab = exports.lab = Lab.script()

require('events').EventEmitter.defaultMaxListeners = Infinity

var seneca

function createSeneca () {
  return require('seneca')({
    log: 'silent',
    define_plugins: {
      basic: false
    }
  })
  .use('../basic.js')
}

lab.experiment('seneca.basic', function () {
  lab.beforeEach(function (done) {
    seneca = createSeneca()
    if (seneca.version >= '2.0.0') {
      seneca.use('entity')
    }
    seneca.ready(done)
  })

  lab.test('note get', function (done) {
    seneca.act('role:basic,note:true,cmd:set,key:name,value:app1', function (err) {
      Assert.equal(err, null)
      seneca.act('role:basic,note:true,cmd:get,key:name', function (err, response) {
        Assert.equal(err, null)
        Assert.ok(response)
        Assert.ok(response.value)
        Assert.equal(response.value, 'app1')
        done()
      })
    })
  })

  lab.test('note list', function (done) {
    seneca.act('role:basic,note:true,cmd:push,key:name,value:app1', function (err) {
      Assert.equal(err, null)
      seneca.act('role:basic,note:true,cmd:list,key:name', function (err, response) {
        Assert.equal(err, null)
        Assert.ok(response)
        Assert.deepEqual(response, ['app1'])
        done()
      })
    })
  })

  lab.test('note list empty', function (done) {
    seneca.act('role:basic,note:true,cmd:list,key:name', function (err, value) {
      Assert.equal(err, null)
      Assert.ok(value)
      Assert.deepEqual(value, [])
      done()
    })
  })


  lab.test('note pop', function (done) {
    seneca.act('role:basic,note:true,cmd:push,key:name,value:app1', function (err) {
      Assert.equal(err, null)
      seneca.act('role:basic,note:true,cmd:list,key:name', function (err, response) {
        Assert.equal(err, null)
        Assert.ok(response)
        Assert.deepEqual(response, ['app1'])

        seneca.act('role:basic,note:true,cmd:pop,key:name', function (err, response) {
          Assert.equal(err, null)
          Assert.ok(response)
          Assert.ok(response.value)
          Assert.equal(response.value, 'app1')

          seneca.act('role:basic,note:true,cmd:list,key:name', function (err, response) {
            Assert.equal(err, null)
            Assert.ok(response)
            Assert.deepEqual(response, [])

            done()
          })
        })
      })
    })
  })

  lab.test('note list and values have different namespaces', function (done) {
    Async.series([
      function (next) {
        seneca.act('role:basic,note:true,cmd:push,key:name,value:1', function (err) {
          Assert.equal(err, null)
          next()
        })
      },
      function (next) {
        seneca.act('role:basic,note:true,cmd:set,key:name,value:2', function (err) {
          Assert.ok(!err)
          next()
        })
      },
      function (next) {
        seneca.act('role:basic,note:true,cmd:get,key:name', function (err, response) {
          Assert.equal(err, null)
          Assert.ok(response)
          Assert.equal(response.value, '2')
          next()
        })
      },
      function (next) {
        seneca.act('role:basic,note:true,cmd:list,key:name', function (err, response) {
          Assert.equal(err, null)
          Assert.ok(response)
          Assert.deepEqual(response, ['1'])
          next()
        })
      }], done)
  })

  lab.test('note push', function (done) {
    Async.series([
      function (next) {
        seneca.act('role:basic,note:true,cmd:push,key:k0,value:i0', function (err) {
          Assert.equal(err, null)
          next()
        })
      },
      function (next) {
        seneca.act('role:basic,note:true,cmd:list,key:k0', function (err, out) {
          Assert.equal(err, null)
          Assert.deepEqual(['i0'], out)
          next()
        })
      },
      function (next) {
        seneca.act('role:basic,note:true,cmd:push,key:k0,value:i1', function (err, response) {
          Assert.equal(err, null)

          next()
        })
      },
      function (next) {
        seneca.act('role:basic,note:true,cmd:list,key:k0', function (err, out) {
          Assert.equal(err, null)
          Assert.deepEqual(['i0', 'i1'], out)

          next()
        })
      }], done)
  })

  lab.test('quickcode basic', function (done) {
    seneca.act({role: 'basic', cmd: 'quickcode'}, function (err, code) {
      Assert.ifError(err)
      Assert.ok(code)
      Assert.equal(code.length, 8)
      Assert.ok(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) == null)
      done()
    })
  })

  lab.test('quickcode basic with length', function (done) {
    seneca.act({role: 'basic', cmd: 'quickcode', length: 12}, function (err, code) {
      Assert.ifError(err)
      Assert.ok(code)
      Assert.equal(code.length, 12)
      Assert.ok(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) == null)
      done()
    })
  })

  lab.test('quickcode basic with alphabet', function (done) {
    seneca.act({role: 'basic', cmd: 'quickcode', alphabet: 'abcdef'}, function (err, code) {
      Assert.ifError(err)
      Assert.ok(code)
      Assert.equal(code.length, 8)
      Assert.ok(/[ABCDEF]/.exec(code) == null)
      done()
    })
  })

  lab.test('quickcode basic with curses', function (done) {
    seneca.act({role: 'basic', cmd: 'quickcode', curses: 'damn'}, function (err, code) {
      Assert.ifError(err)
      Assert.ok(code)
      Assert.equal(code.length, 8)
      Assert.ok(/[ABCDEF]/.exec(code) == null)
      done()
    })
  })

  lab.test('generate_id basic', function (done) {
    seneca.act({ role: 'basic', cmd: 'generate_id' }, function (err, id) {
      Assert.ifError(err)
      Assert.ok(id)
      Assert.equal(id.length, 6)
      done()
    })
  })

  lab.test('define_sys_entity', function (done) {
    seneca.act({ role: 'basic', cmd: 'define_sys_entity' }, function (err, resp) {
      Assert.ifError(err)
      Assert.ok(resp)
      done()
    })
  })

  lab.test('define_sys_entity with list', function (done) {
    seneca.act({ role: 'basic', cmd: 'define_sys_entity', list: 'entity' }, function (err, resp) {
      Assert.ifError(err)
      Assert.ok(resp)
      done()
    })
  })

  lab.test('define_sys_entity with list and string entity', function (done) {
    seneca.act({ role: 'basic', cmd: 'define_sys_entity', list: [{entity: 'ent'}] }, function (err, resp) {
      Assert.ifError(err)
      Assert.ok(resp)
      done()
    })
  })

  lab.test('define_sys_entity with list and non object entity', function (done) {
    seneca.act({ role: 'basic', cmd: 'define_sys_entity', list: [1] }, function (err, resp) {
      Assert.ifError(err)
      Assert.ok(resp)
      done()
    })
  })

  lab.test('define_sys_entity with list and a seneca entity', function (done) {
    var product = seneca.make('product')
    seneca.act({ role: 'basic', cmd: 'define_sys_entity', list: [product] }, function (err, resp) {
      Assert.ifError(err)
      Assert.ok(resp)
      done()
    })
  })

  lab.test('utilfuncs pathnorm empty path', function (done) {
    var basic = createSeneca().export('basic')
    var path = basic.pathnorm('')
    Assert.ok(path)
    Assert.equal(path, '.')
    done()
  })

  lab.test('utilfuncs pathnorm null path', function (done) {
    var basic = createSeneca().export('basic')
    var path = basic.pathnorm(null)
    Assert.ok(path)
    Assert.equal(path, '.')
    done()
  })
})
