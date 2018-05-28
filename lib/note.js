'use strict'

module.exports = function () {
  var note_single = {}
  var note_values = {}

  function set (msg, reply) {
    note_single[msg.key] = msg.value
    reply()
  }

  function get (msg, reply) {
    reply({ value: note_single[msg.key] })
  }

  function list (msg, reply) {
    reply(note_values[msg.key] || [])
  }

  function push (msg, reply) {
    note_values[msg.key] = note_values[msg.key] || []
    note_values[msg.key].push(msg.value)
    reply()
  }

  function pop (msg, reply) {
    reply({ value: note_values[msg.key].pop() })
  }

  return {
    set: set,
    get: get,
    list: list,
    pop: pop,
    push: push
  }
}
