'use strict'

var Nid = require('nid')

function quickcode (args, done) {
  args.len = args.length || args.len
  var len = args.len ? parseInt(args.len, 10) : 8
  var alphabet = args.alphabet || '0123456789abcdefghijklmnopqrstuvwxyz'
  var curses = args.curses

  var nidopts = {}
  if (len) nidopts.length = len
  if (alphabet) nidopts.alphabet = alphabet
  if (curses) nidopts.curses = curses

  var actnid = Nid(nidopts)

  done(null, actnid())
}

// cache nid funcs up to length 64
var nids = []

// TODO: allow specials based on ent canon: name,base,zone props
function generate_id (args, done) {
  var actnid
  var length = args.length || 6

  if (length < 65) {
    actnid = nids[length] || (nids[length] = Nid({length: length}))
  }
  else {
    actnid = Nid({length: length})
  }

  done(null, actnid())
}

module.exports = {
  quickcode: quickcode,
  generate_id: generate_id
}
