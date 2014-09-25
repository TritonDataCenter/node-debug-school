var exec = require('child_process').exec;

function executeshellscript (exercise, preCommands, checkCallback) {

  function setup (mode, callback) {
    var submission = this.args[0]

    function checkSubmission(err, stdout, stderr) {
      checkCallback(err, stdout, stderr, function onCheckDone(err, result) {
        if (result) {
          return callback();
        } else {
          return callback(new Error("Check failed!"));
        }
      });
    }

    exec(preCommands.join(';') + ';' + 'sh ' + submission, checkSubmission);
  }

  exercise.addSetup(setup);
  return exercise
}

module.exports = executeshellscript
