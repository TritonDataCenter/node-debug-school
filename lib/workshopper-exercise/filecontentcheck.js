const fs = require('fs')

function filecontentcheck (exercise, checkCallback) {

  function processor (mode, callback) {
    var submission = this.args[0]

    fs.readFile(submission, function(err, data) {
      checkCallback(data, callback);
    });
  }

  exercise.addProcessor(processor);
  return exercise
}

module.exports = filecontentcheck
