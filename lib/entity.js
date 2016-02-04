'use strict'

var _ = require('lodash')
var Async = require('async')

module.exports = function (options) {
  function define_sys_entity (args, done) {
    var seneca = this
    var list = args.list || [_.pick(args, ['entity', 'zone', 'base', 'name', 'fields'])]
    list = _.isArray(list) ? list : list.split(/\s*,\s*/)

    var sys_entity = seneca.make$('sys', 'entity')

    function define (entry, next) {
      if (_.isString(entry)) {
        entry = seneca.util.parsecanon(entry)
      }
      else if (_.isString(entry.entity)) {
        var fields = entry.fields
        entry = seneca.util.parsecanon(entry.entity)
        entry.fields = fields
      }
      else if (_.isObject(entry) && entry.entity$) {
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

    Async.mapLimit(list || [], options.limit.parallel, define, done)
  }

  function ensure_entity (args, done) {
    var seneca = this
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
          }
          else if (_.isObject(args[entarg])) {
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

  return {
    ensure: ensure_entity,
    defineSys: define_sys_entity
  }
}
