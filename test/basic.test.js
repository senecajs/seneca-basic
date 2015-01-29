/* Copyright (c) 2010-2015 Richard Rodger */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var assert = require('assert')
var _      = require('lodash')
var util   = require('util')


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
})


