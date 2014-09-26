const fs = require('fs')

function cmdargscheck (exercise, checkCallback) {

  function processor (mode, callback) {
    checkCallback(this.args, callback);
  }

  exercise.addProcessor(processor);
  return exercise
}

module.exports = cmdargscheck
