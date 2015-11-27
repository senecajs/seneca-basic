'use strict'

module.exports = function () {
  var note_single = {}
  var note_values = {}

  function set (args, done) {
    note_single[args.key] = args.value
    this.good()
  }

  function get (args, done) {
    this.good({ value: note_single[args.key] })
  }

  function list (args, done) {
    this.good(note_values[args.key] || [])
  }

  function push (args, done) {
    note_values[args.key] = note_values[args.key] || []
    note_values[args.key].push(args.value)
    this.good()
  }

  function pop (args, done) {
    this.good({ value: note_values[args.key].pop() })
  }

  return {
    set: set,
    get: get,
    list: list,
    pop: pop,
    push: push
  }
}
