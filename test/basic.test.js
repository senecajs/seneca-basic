/* Copyright (c) 2010-2015 Richard Rodger */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var assert = require('assert')
var _      = require('lodash')
var util   = require('util')

var Lab = require('lab');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;

var seneca = require('seneca')({
  log: 'silent',
  define_plugins:{
    basic:false
  }
}).use('../basic.js')


describe('seneca.basic', function() {
  it('quickcode', function(fin) {
    seneca.act({role:'basic',cmd:'quickcode'},function(err,code){
      assert.ok(null==err)
      assert.equal( 8, code.length )
      assert.ok(null== /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) )
      fin()
    })
  })

  it('note',function(fin){
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
})


