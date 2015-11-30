/* Copyright (c) 2011-2015 Richard Rodger */
'use strict'

var path = require('path')

var Note = require('./lib/note')
var Entity = require('./lib/entity')
var uniqueid = require('./lib/uniqueid')
var common = require('./lib/common')

function registerNote (seneca, note) {
  // The note patterns let you pass information to plugins that are
  // loaded after the current plugin. See seneca-admin
  seneca.add({role: common.plugin.name, note: true, cmd: 'set'}, note.set)
  seneca.add({role: common.plugin.name, note: true, cmd: 'get'}, note.get)
  seneca.add({role: common.plugin.name, note: true, cmd: 'list'}, note.list)
  seneca.add({role: common.plugin.name, note: true, cmd: 'push'}, note.push)
  seneca.add({role: common.plugin.name, note: true, cmd: 'pop'}, note.pop)

  // Legacy cmds use role:'util'
  seneca.add({role: 'util', note: true, cmd: 'set', deprecate$: common.messages.UTIL_DEPRECATED}, note.set)
  seneca.add({role: 'util', note: true, cmd: 'get', deprecate$: common.messages.UTIL_DEPRECATED}, note.get)
  seneca.add({role: 'util', note: true, cmd: 'list', deprecate$: common.messages.UTIL_DEPRECATED}, note.list)
  seneca.add({role: 'util', note: true, cmd: 'push', deprecate$: common.messages.UTIL_DEPRECATED}, note.push)
  seneca.add({role: 'util', note: true, cmd: 'pop', deprecate$: common.messages.UTIL_DEPRECATED}, note.pop)
}

function registerEntity (seneca, entity) {
  // TODO: this should be a utility function, not a pattern
  seneca.add({
    role: common.plugin.name,
    cmd: 'ensure_entity',
    pin: {required$: true},
    // TODO: accept entity spec here, e.g. strings like 'sys/user'
    entmap: {object$: true, required$: true}
  }, entity.ensure)
  seneca.add({role: common.plugin.name, cmd: 'define_sys_entity'}, entity.defineSys)

  // Legacy cmds use role:'util'
  seneca.add({role: 'util', cmd: 'ensure_entity'}, entity.ensure)
  seneca.add({role: 'util', cmd: 'define_sys_entity'}, entity.defineSys)
}

function registerUniqueId (seneca) {
  seneca.add({role: common.plugin.name, cmd: 'quickcode', deprecate$: common.messages.MARKED_FOR_REMOVAL}, uniqueid.quickcode)
  seneca.add({role: common.plugin.name, cmd: 'generate_id'}, uniqueid.generate_id)

  // Legacy cmds use role:'util'
  seneca.add({role: 'util', cmd: 'quickcode', deprecate$: common.messages.UTIL_DEPRECATED}, uniqueid.quickcode)
  seneca.add({role: 'util', cmd: 'generate_id'}, uniqueid.generate_id)
}

module.exports = function (options) {
  var seneca = this

  options = seneca.util.deepextend({ limit: { parallel: 11 } }, options)

  var note = Note()
  var entity = Entity(options)

  registerUniqueId(seneca)
  registerEntity(seneca, entity)
  registerNote(seneca, note)

  var utilfuncs = {
    pathnorm: function (pathstr) {
      return path.normalize((pathstr == null) ? '' : '' + pathstr).replace(/\/+$/, '')
    },
    deepextend: seneca.util.deepextend
  }

  return {
    name: common.plugin.name,
    export: utilfuncs
  }
}
