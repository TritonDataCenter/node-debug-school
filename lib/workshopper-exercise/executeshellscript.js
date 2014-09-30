var spawn = require('child_process').spawn;
var fs    = require('fs');

var async = require('async');
var debug = require('debug')('debug-school');

function executeshellscript (exercise, preCommands, postCommands, checkCallback) {

  function processor (mode, callback) {
    var submission = this.args[0]

    function checkSubmission(err, stdout, stderr) {
      checkCallback(err, stdout, stderr, callback);
    }

    function runCommands(commands, shell, callback) {
      if (commands) {
        async.eachSeries(commands, function (command, done) {
          debug('Running command: ' + command + '...');

          shell.stdin.write(command + '\n', done);
        }, callback);
      }
    }

    function runCommandsFromFile(file, shell, callback) {
      debug('Running commands from file [' + file + ']...');

      fs.readFile(submission, function (err, data) {
        shell.stdin.write(data, function doneWriting(err) {
          return callback(err);
        });
      });
    }

    var shell = spawn('/bin/bash', ['-x']);
    var stdout = '';
    var stderr = '';

    shell.stdout.on('data', function (data) {
      debug('shell STDOUT: ' + data);
      stdout += data.toString();
    });

    shell.stderr.on('data', function (data) {
      debug('shell STDERR: ' + data.toString());
      stderr += data.toString();
    });

    shell.on('close', function onClose(exitCode) {
      return checkSubmission(null, stdout, stderr);
    });

    shell.on('error', function onError(err) {
      return callback(err);
    });

    async.series([
      runCommands.bind(global, preCommands, shell),
      runCommandsFromFile.bind(global, submission, shell),
      runCommands.bind(global, postCommands, shell),
    ]);
  }

  exercise.addProcessor(processor);
  return exercise;
}

module.exports = executeshellscript;
