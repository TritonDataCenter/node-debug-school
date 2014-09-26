const fs = require('fs')

function filecustomcheck (exercise, checkCallback) {

  function processor (mode, callback) {
    var submission = this.args[0]

    checkCallback(submission, callback);
  }

  exercise.addProcessor(processor);
  return exercise
}

module.exports = filecustomcheck
