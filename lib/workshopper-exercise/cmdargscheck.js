const fs = require('fs')

function cmdargscheck (exercise, checkCallback) {

  function setup (mode, callback) {
    checkCallback(this.args, function onCheckDone(err, result) {
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

module.exports = cmdargscheck
