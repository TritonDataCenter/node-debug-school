const fs = require('fs')

function filecontentcheck (exercise, checkCallback) {

  function setup (mode, callback) {
    var submission = this.args[0]

    fs.readFile(submission, function(err, data) {
      checkCallback(data, function onCheckDone(err, result) {
        if (result) {
          return callback();
        } else {
          return callback(new Error("Check failed!"));
        }
      });
    });
  }

  exercise.addSetup(setup);
  return exercise
}

module.exports = filecontentcheck
