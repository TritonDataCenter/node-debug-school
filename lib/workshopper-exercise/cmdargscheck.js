const fs = require('fs')

function cmdargscheck (exercise, checkCallback) {

  function processor (mode, callback) {
    checkCallback(this.args, function onCheckDone(err, result) {
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

module.exports = cmdargscheck
