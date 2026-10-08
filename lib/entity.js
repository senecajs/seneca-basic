"use strict";

var Async = require("async");

// Entity utilities: define system entities in the sys/entity collection,
// and load the entities named in a message before an action runs.
module.exports = function(options) {
  function define_sys_entity(args, done) {
    var seneca = this;
    var list = args.list || [
      pick(args, ["entity", "zone", "base", "name", "fields"])
    ];
    list = Array.isArray(list) ? list : list.split(/\s*,\s*/);

    var sys_entity = seneca.make$("sys", "entity");

    function define(entry, next) {
      if (isString(entry)) {
        entry = seneca.util.parsecanon(entry);
      } else if (isString(entry.entity)) {
        var fields = entry.fields;
        entry = seneca.util.parsecanon(entry.entity);
        entry.fields = fields;
      } else if (isObject(entry) && entry.entity$) {
        entry = entry.canon$({ object: true });
      }

      var entq = { zone: entry.zone, base: entry.base, name: entry.name };

      sys_entity.load$(entq, function(err, entity) {
        if (err) return next(err);

        var save = false;

        if (entity == null) {
          entity = sys_entity.make$(entry);
          save = true;
        }

        if (entity.fields == null) {
          entity.fields = [];
          save = true;
        }

        if (save) {
          entity.save$(function(err, ent) {
            return next(err, ent);
          });
        } else return next(null, entity);
      });
    }

    Async.mapLimit(list || [], options.limit.parallel, define, done);
  }

  function ensure_entity(args, done) {
    var seneca = this;
    var entmap = args.entmap;

    seneca.wrap(args.pin, function(args, done) {
      var seneca = this;

      // Resolve the entity properties one after the other (Seneca 4 no
      // longer provides seneca.util.recurse), then call the original
      // action with the updated message.
      Async.eachSeries(
        Object.keys(entmap || {}),
        function(entarg, next) {
          // ent id
          if (isString(args[entarg])) {
            entmap[entarg].load$(args[entarg], function(err, ent) {
              if (err) return next(err);
              args[entarg] = ent;
              return next();
            });
          }

          // ent JSON: contains entity$ or $:{name,base,zone}
          else if (
            isObject(args[entarg]) &&
            (args[entarg].entity$ || args[entarg].$)
          ) {
            args[entarg] = entmap[entarg].make$(args[entarg]);
            return next();
          }

          // anything else is left as it is
          else return next();
        },
        function(err) {
          if (err) return done(err);
          return seneca.prior(args, done);
        }
      );
    });

    done();
  }

  return {
    ensure: ensure_entity,
    defineSys: define_sys_entity
  };
};

// Plain replacements for the lodash functions used before.

// Copy the listed properties that exist (own or inherited), as _.pick.
function pick(obj, keys) {
  var out = {};
  keys.forEach(function(key) {
    if (key in obj) out[key] = obj[key];
  });
  return out;
}

// String primitives and String objects, as _.isString.
function isString(value) {
  return (
    "string" === typeof value ||
    "[object String]" === Object.prototype.toString.call(value)
  );
}

// Objects and functions, as _.isObject.
function isObject(value) {
  var type = typeof value;
  return null != value && ("object" === type || "function" === type);
}
