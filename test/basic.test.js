/* Copyright (c) 2010-2014 Richard Rodger */

"use strict";

var assert = require('chai').assert
var _      = require('underscore')
var util   = require('util')

var seneca = require('seneca')({log:'silent'})
      .use('../basic.js')



describe('seneca.basic', function() {
  it('quickcode', function(fin) {
    seneca.act({role:'util',cmd:'quickcode'},function(err,code){
      assert.isNull(err)
      assert.equal( 8, code.length )
      assert.isNull( /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/.exec(code) )
      fin()
    })
  })

})
