const fs = require('fs')

function filecustomcheck (exercise, checkCallback) {

  function setup (mode, callback) {
    var submission = this.args[0]

    checkCallback(submission, function onCheckDone(err, result) {
      if (result) {
        return callback();
      } else {
        return callback(new Error("Check failed!"));
      }
    });
  }

  exercise.addSetup(setup);
  return exercise
}

module.exports = filecustomcheck
