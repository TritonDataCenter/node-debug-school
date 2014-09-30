var exec = require('child_process').exec;
var fs   = require('fs');

var async = require('async');
var debug = require('debug')('debug-school');

function executeshellscript (exercise, preCommands, postCommands, checkCallback) {

  function processor (mode, callback) {
    var submission = this.args[0]

    function checkSubmission(err, stdout, stderr) {
      checkCallback(err, stdout, stderr, callback);
    }

    fs.readFile(submission, function (err, data) {
      if (err) {
        return callback(err);
      } else {
        var scriptContent = '';
        if (data) {
          scriptContent = data.toString();
        }
        scriptContent = preCommands.join(';') + ';' + scriptContent;
        scriptContent += postCommands.join(';');

        debug('Executing script:');
        debug(scriptContent);
        exec(scriptContent, checkSubmission);
      }
    });
  }

  exercise.addProcessor(processor);
  return exercise;
}

module.exports = executeshellscript;
