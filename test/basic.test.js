/* Copyright (c) 2010-2015 Richard Rodger */
/* jshint node:true, asi:true, eqnull:true */
"use strict";

var assert = require('assert')
var _      = require('lodash')
var util   = require('util')

var Lab = require('lab');
var lab = exports.lab = Lab.script();

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

  lab.test('note', function(fin) {
    seneca
      .start(fin)

      .wait('role:basic,note:true,cmd:set,key:k0,value:v0')
      .wait('role:basic,note:true,cmd:get,key:k0')
      .step(function(out){
        assert.equal('v0',out.value)
        return true;
      })

      .wait('role:basic,note:true,cmd:set,key:k0,value:v1')
      .wait('role:basic,note:true,cmd:get,key:k0')
      .step(function(out){
        assert.equal('v1',out.value)
        return true;
      })

      .wait('role:basic,note:true,cmd:push,key:k0,value:i0')
      .wait('role:basic,note:true,cmd:list,key:k0')
      .step(function(out){
        assert.deepEqual(['i0'],out)
        return true;
      })

      .wait('role:basic,note:true,cmd:push,key:k0,value:i1')
      .wait('role:basic,note:true,cmd:list,key:k0')
      .step(function(out){
        assert.deepEqual(['i0','i1'],out)
        return true;
      })

      .wait('role:basic,note:true,cmd:pop,key:k0')
      .step(function(out){
        assert.equal('i1',out.value)
        return true;
      })

      .wait('role:basic,note:true,cmd:pop,key:k0')
      .step(function(out){
        assert.equal('i0',out.value)
        return true;
      })

      .wait('role:basic,note:true,cmd:list,key:k0')
      .step(function(out){
        assert.deepEqual([],out)
        return true;
      })

    // lists and singles are separate namespaces 
      .wait('role:basic,note:true,cmd:get,key:k0')
      .step(function(out){
        assert.equal('v1',out.value)
        return true;
      })

      .end()
  })
  
  lab.test('quickcode', function(done) {
    seneca.act({role:'basic', cmd:'quickcode'}, function(err, code) {
      assert.ifError(err)
      assert.ok(code)
      assert.equal(code.length, 8)
      assert.ok(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) == null)
      done()
    })
  })
  
  lab.test('quickcode', function(done) {
    seneca.act({role:'util', cmd:'quickcode'}, function(err, code) {
      assert.ok(code)
      assert.ifError(err)
      assert.equal(code.length, 8)
      assert.ok(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) == null)
      done()
    })
  })
  
  lab.test('generate_id', function (done) {
    seneca.act({ role: 'basic', cmd: 'generate_id' }, function (err, id) {
      assert.ifError(err)
      assert.ok(id)
      assert.equal(id.length, 6)
      done()
    })
  })
  
  lab.test('generate_id', function (done) {
    seneca.act({ role: 'util', cmd: 'generate_id' }, function (err, id) {
      assert.ifError(err)
      assert.ok(id)
      assert.equal(id.length, 6)
      done()
    })
  })
})


