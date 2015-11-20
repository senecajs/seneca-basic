/* Copyright (c) 2010-2015 Richard Rodger */
/* jshint node:true, asi:true, eqnull:true */
"use strict";

var assert = require('assert')
var _      = require('lodash')
var util   = require('util')

var Lab = require('lab')
var lab = exports.lab = Lab.script()

require('events').EventEmitter.defaultMaxListeners = Infinity;

var seneca; 

function createSeneca() {
  return require('seneca')({
    log: 'silent',
    define_plugins: {
      basic: false
    }
  })
  .use('../basic.js')
}

lab.experiment('seneca.basic', function() {
  
  lab.beforeEach(function (done) {
    seneca = createSeneca()       
    done();
  });
       
  lab.test('note get', function (done) {
    seneca
      .start()
      .wait('role:basic,note:true,cmd:set,key:name,value:app1')
      .wait('role:basic,note:true,cmd:get,key:name')
      .step(function (response) {
        assert.ok(response)
        assert.ok(response.value)
        assert.equal(response.value, 'app1')
        return true
      })
      .end(done)
  })
  
  lab.test('note list', function (done) {
    seneca
      .start()
      .wait('role:basic,note:true,cmd:push,key:name,value:app1')
      .wait('role:basic,note:true,cmd:list,key:name')
      .step(function (value) {
        assert.ok(value)
        assert.deepEqual(value, ['app1'])
        return true
      })
      .end(done)
  })
  
  lab.test('note list empty', function (done) {
    seneca
      .start()
      .wait('role:basic,note:true,cmd:list,key:name')
      .step(function (value) {
        assert.ok(value)
        assert.deepEqual(value, [])
        return true
      })
      .end(done)
  })
  
  
  lab.test('note pop', function (done) {
    seneca
      .start()
      .wait('role:basic,note:true,cmd:push,key:name,value:app1')
      .wait('role:basic,note:true,cmd:list,key:name')
      .step(function (response) {
        assert.ok(response)
        assert.deepEqual(response, ['app1'])
        return true
      })
      .wait('role:basic,note:true,cmd:pop,key:name')
      .step(function (response) {
        assert.ok(response)
        assert.ok(response.value)
        assert.equal(response.value, 'app1')
        return true
      })
      .wait('role:basic,note:true,cmd:list,key:name')
      .step(function (response) {
        assert.ok(response)
        assert.deepEqual(response, [])
        return true
      })
      .end(done)
  })
  
  lab.test('note list and values have different namespaces', function (done) {
    seneca
      .start()
      .wait('role:basic,note:true,cmd:push,key:name,value:1')
      .wait('role:basic,note:true,cmd:set,key:name,value:2')
      .wait('role:basic,note:true,cmd:get,key:name')
      .step(function (response) {
        assert.ok(response)
        assert.equal(response.value, '2')
        return true
      })
      .wait('role:basic,note:true,cmd:list,key:name')
      .step(function (response) {
        assert.ok(response)
        assert.deepEqual(response, ['1'])
        return true
      })
      .end(done)
  })

  lab.test('note push', function (done) {
    seneca
      .start()
      .wait('role:basic,note:true,cmd:push,key:k0,value:i0')
      .wait('role:basic,note:true,cmd:list,key:k0')
      .step(function (out) {
        assert.deepEqual(['i0'], out)
        return true
      })
      
      .wait('role:basic,note:true,cmd:push,key:k0,value:i1')
      .wait('role:basic,note:true,cmd:list,key:k0')
      .step(function (out) {
        assert.deepEqual(['i0', 'i1'], out)
        return true
      })
      .end(done)
  })
  
  lab.test('quickcode basic', function (done) {
    seneca.act({role:'basic', cmd:'quickcode'}, function (err, code) {
      assert.ifError(err)
      assert.ok(code)
      assert.equal(code.length, 8)
      assert.ok(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) == null)
      done()
    })
  })
  
  lab.test('quickcode basic with length', function (done) {
    seneca.act({role:'basic', cmd:'quickcode', length: 12}, function (err, code) {
      assert.ifError(err)
      assert.ok(code)
      assert.equal(code.length, 12)
      assert.ok(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) == null)
      done()
    })    
  })
  
  lab.test('quickcode basic with alphabet', function (done) {
    seneca.act({role:'basic', cmd:'quickcode', alphabet: 'abcdef'}, function (err, code) {
      assert.ifError(err)
      assert.ok(code)
      assert.equal(code.length, 8)
      assert.ok(/[ABCDEF]/.exec(code) == null)
      done()
    })
  })
  
  lab.test('quickcode basic with curses', function (done) {
    seneca.act({role:'basic', cmd:'quickcode', curses: 'damn'}, function (err, code) {
      assert.ifError(err)
      assert.ok(code)
      assert.equal(code.length, 8)
      assert.ok(/[ABCDEF]/.exec(code) == null)
      done()
    })
  })
  
  lab.test('generate_id basic', function (done) {
    seneca.act({ role: 'basic', cmd: 'generate_id' }, function (err, id) {
      assert.ifError(err)
      assert.ok(id)
      assert.equal(id.length, 6)
      done()
    })
  })
  
  lab.test('define_sys_entity', function (done) {
    seneca.act({ role: 'basic', cmd: 'define_sys_entity' }, function (err, resp) {
      assert.ifError(err)
      assert.ok(resp)
      done()
    })
  })
  
  lab.test('define_sys_entity with list', function (done) {
    seneca.act({ role: 'basic', cmd: 'define_sys_entity', list: 'entity' }, function (err, resp) {
      assert.ifError(err)
      assert.ok(resp)
      done()
    })
  })
  
  lab.test('define_sys_entity with list and string entity', function (done) {
    seneca.act({ role: 'basic', cmd: 'define_sys_entity', list: [{entity: 'ent'}] }, function (err, resp) {
      assert.ifError(err)
      assert.ok(resp)
      done()
    })
  })
  
  lab.test('define_sys_entity with list and non object entity', function (done) {
    seneca.act({ role: 'basic', cmd: 'define_sys_entity', list: [1] }, function (err, resp) {
      assert.ifError(err)
      assert.ok(resp)
      done()
    })
  })
  
  lab.test('define_sys_entity with list and a seneca entity', function (done) {
    var product = seneca.make('product')
    seneca.act({ role: 'basic', cmd: 'define_sys_entity', list: [product] }, function (err, resp) {
      assert.ifError(err)
      assert.ok(resp)
      done()
    })
  })
  
  lab.test('utilfuncs pathnorm empty path', function (done) {
    var basic = createSeneca().export('basic')    
    var path = basic.pathnorm('')
    assert.ok(path)
    assert.equal(path, '.')
    done()
  })
  
  lab.test('utilfuncs pathnorm null path', function (done) {
    var basic = createSeneca().export('basic')    
    var path = basic.pathnorm(null)
    assert.ok(path)
    assert.equal(path, '.')
    done()
  })
})


