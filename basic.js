/* Copyright (c) 2011-2015 Richard Rodger */
'use strict'

var path = require('path')

var _ = require('lodash')
var async = require('async')

var Note = require('./lib/note')
var uniqueid = require('./lib/uniqueid')

module.exports = function (options) {
  var name = 'basic'
  var seneca = this

  var note = Note()

  options = seneca.util.deepextend({
    limit: { parallel: 11 }
  }, options)

  // deprecation messages
  var marked_remove = 'marked for removal in future'
  var util_dep_msg = 'role:util patterns are replaced by role:basic.'

  // legacy cmds use role:'util'

  seneca.add({role: name, cmd: 'quickcode', deprecate$: marked_remove}, uniqueid.quickcode)
  seneca.add({role: 'util', cmd: 'quickcode', deprecate$: util_dep_msg}, uniqueid.quickcode)

  seneca.add({role: name, cmd: 'generate_id'}, uniqueid.generate_id)
  seneca.add({role: 'util', cmd: 'generate_id'}, uniqueid.generate_id)

  // TODO: this should be a utility function, not a pattern
  seneca.add({
    role: name,
    cmd: 'ensure_entity',
    pin: {required$: true},
    // TODO: accept entity spec here, e.g. strings like 'sys/user'
    entmap: {object$: true, required$: true}
  }, ensure_entity)

  seneca.add({role: 'util', cmd: 'ensure_entity'}, ensure_entity)
  seneca.add({role: name, cmd: 'define_sys_entity'}, cmd_define_sys_entity)
  seneca.add({role: 'util', cmd: 'define_sys_entity'}, cmd_define_sys_entity)

  // The note patterns let you pass information to plugins that are
  // loaded after the current plugin. See seneca-admin

  seneca.add({role: name, note: true, cmd: 'set'}, note.set)
  seneca.add({role: name, note: true, cmd: 'get'}, note.get)
  seneca.add({role: name, note: true, cmd: 'list'}, note.list)
  seneca.add({role: name, note: true, cmd: 'push'}, note.push)
  seneca.add({role: name, note: true, cmd: 'pop'}, note.pop)

  seneca.add({role: 'util', note: true, cmd: 'set', deprecate$: util_dep_msg}, note.set)
  seneca.add({role: 'util', note: true, cmd: 'get', deprecate$: util_dep_msg}, note.get)
  seneca.add({role: 'util', note: true, cmd: 'list', deprecate$: util_dep_msg}, note.list)
  seneca.add({role: 'util', note: true, cmd: 'push', deprecate$: util_dep_msg}, note.push)
  seneca.add({role: 'util', note: true, cmd: 'pop', deprecate$: util_dep_msg}, note.pop)

  function ensure_entity (args, done) {
    var entmap = args.entmap

    seneca.wrap(args.pin, function (args, done) {
      var seneca = this

      seneca.util.recurse(
        _.keys(entmap),
        function (entarg, next) {
          // ent id
          if (_.isString(args[entarg])) {
            entmap[entarg].load$(args[entarg], function (err, ent) {
              if (err) return done(err)
              args[entarg] = ent
              return next(null, args)
            })
          // ent JSON
          } else if (_.isObject(args[entarg])) {
            // contains entity$ or $:{name,base,zone}
            if (args[entarg].entity$ || args[entarg].$) {
              args[entarg] = entmap[entarg].make$(args[entarg])
              return next(null, args)
            }
          }

          else return next(null, args)
        },
        function (err, args) {
          if (err) return done(err)
          return seneca.prior(args, done)
        }
      )
    })

    done()
  }

  function cmd_define_sys_entity (args, done) {
    var seneca = this
    var list = args.list || [_.pick(args, ['entity', 'zone', 'base', 'name', 'fields'])]
    list = _.isArray(list) ? list : list.split(/\s*,\s*/)

    var sys_entity = seneca.make$('sys', 'entity')

    function define (entry, next) {
      if (_.isString(entry)) {
        entry = seneca.util.parsecanon(entry)
      } else if (_.isString(entry.entity)) {
        var fields = entry.fields
        entry = seneca.util.parsecanon(entry.entity)
        entry.fields = fields
      } else if (_.isObject(entry) && entry.entity$) {
        entry = entry.canon$({object: true})
      }

      var entq = { zone: entry.zone, base: entry.base, name: entry.name }

      sys_entity.load$(entq, function (err, entity) {
        if (err) return next(err)

        var save = false

        if (entity == null) {
          entity = sys_entity.make$(entry)
          save = true
        }

        if (entity.fields == null) {
          entity.fields = []
          save = true
        }

        if (save) {
          entity.save$(function (err, ent) {
            return next(err, ent)
          })
        }
        else return next(null, entity)
      })
    }

    async.mapLimit(list || [], options.limit.parallel, define, done)
  }

  var utilfuncs = {
    pathnorm: function (pathstr) {
      return path.normalize((pathstr == null) ? '' : '' + pathstr).replace(/\/+$/, '')
    },
    deepextend: seneca.util.deepextend
  }

  return {
    name: name,
    export: utilfuncs
  }
}
