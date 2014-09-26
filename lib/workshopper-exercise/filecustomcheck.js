const fs = require('fs')

function filecustomcheck (exercise, checkCallback) {

  function processor (mode, callback) {
    var submission = this.args[0]

    checkCallback(submission, function onCheckDone(err, result) {
      if (result) {
        return callback();
      } else {
        return callback(new Error("Check failed!"));
      }
    });
  }

  exercise.addProcessor(processor);
  return exercise
}

module.exports = filecustomcheck
