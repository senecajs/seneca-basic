/* Copyright (c) 2011-2026 Richard Rodger and other contributors, MIT License */
"use strict";

var Path = require("path");
var Note = require("./lib/note");
var Entity = require("./lib/entity");
var Uniqueid = require("./lib/uniqueid");
var Common = require("./lib/common");

function registerNote(seneca, note) {
  // The note patterns let you pass information to plugins that are
  // loaded after the current plugin. See seneca-admin
  seneca.add({ role: Common.plugin.name, note: true, cmd: "set" }, note.set);
  seneca.add({ role: Common.plugin.name, note: true, cmd: "get" }, note.get);
  seneca.add({ role: Common.plugin.name, note: true, cmd: "list" }, note.list);
  seneca.add({ role: Common.plugin.name, note: true, cmd: "push" }, note.push);
  seneca.add({ role: Common.plugin.name, note: true, cmd: "pop" }, note.pop);

  // Legacy cmds use role:'util'
  seneca.add(
    {
      role: "util",
      note: true,
      cmd: "set",
      deprecate$: Common.messages.UTIL_DEPRECATED
    },
    note.set
  );
  seneca.add(
    {
      role: "util",
      note: true,
      cmd: "get",
      deprecate$: Common.messages.UTIL_DEPRECATED
    },
    note.get
  );
  seneca.add(
    {
      role: "util",
      note: true,
      cmd: "list",
      deprecate$: Common.messages.UTIL_DEPRECATED
    },
    note.list
  );
  seneca.add(
    {
      role: "util",
      note: true,
      cmd: "push",
      deprecate$: Common.messages.UTIL_DEPRECATED
    },
    note.push
  );
  seneca.add(
    {
      role: "util",
      note: true,
      cmd: "pop",
      deprecate$: Common.messages.UTIL_DEPRECATED
    },
    note.pop
  );
}

function registerEntity(seneca, entity) {
  // TODO: this should be a utility function, not a pattern
  // TODO: accept entity spec here, e.g. strings like 'sys/user'
  var ensure_pattern = { role: Common.plugin.name, cmd: "ensure_entity" };

  // Message validation rules: pin (a pattern) and entmap (an object of
  // entities) are required. Seneca 3.38 and Seneca 4 compile pattern
  // rules with Gubu, so the rules are built with the core's own copy,
  // seneca.util.Gubu. Releases without it keep the earlier rule objects.
  var Gubu = seneca.util.Gubu;
  if (Gubu) {
    ensure_pattern.pin = Gubu.Required(Gubu.Any());
    ensure_pattern.entmap = Gubu.Required(Gubu.Open({}));
  } else {
    ensure_pattern.pin = { required$: true };
    ensure_pattern.entmap = { object$: true, required$: true };
  }

  seneca.add(ensure_pattern, entity.ensure);
  seneca.add(
    { role: Common.plugin.name, cmd: "define_sys_entity" },
    entity.defineSys
  );

  // Legacy cmds use role:'util'
  seneca.add({ role: "util", cmd: "ensure_entity" }, entity.ensure);
  seneca.add({ role: "util", cmd: "define_sys_entity" }, entity.defineSys);
}

function registerUniqueId(seneca) {
  seneca.add(
    {
      role: Common.plugin.name,
      cmd: "quickcode",
      deprecate$: Common.messages.MARKED_FOR_REMOVAL
    },
    Uniqueid.quickcode
  );

  // TODO: this should be a utility function, not a pattern
  seneca.add(
    { role: Common.plugin.name, cmd: "generate_id" },
    Uniqueid.generate_id
  );

  // Legacy cmds use role:'util'
  seneca.add(
    {
      role: "util",
      cmd: "quickcode",
      deprecate$: Common.messages.UTIL_DEPRECATED
    },
    Uniqueid.quickcode
  );
  seneca.add({ role: "util", cmd: "generate_id" }, Uniqueid.generate_id);
}

var utilfuncs = {
  pathnorm: function(pathstr) {
    return Path.normalize(pathstr == null ? "" : "" + pathstr).replace(
      /\/+$/,
      ""
    );
  }
};

module.exports = function basic(options) {
  var seneca = this;

  options = seneca.util.deepextend({ limit: { parallel: 11 } }, options);

  var note = Note();
  var entity = Entity(options);

  registerUniqueId(seneca);
  registerEntity(seneca, entity);
  registerNote(seneca, note);

  utilfuncs.deepextend = seneca.util.deepextend;
  return {
    export: utilfuncs
  };
};

module.exports.preload = function() {
  var seneca = this;
  utilfuncs.deepextend = seneca.util.deepextend;

  var meta = {
    name: Common.plugin.name,
    export: utilfuncs
  };

  return meta;
};
