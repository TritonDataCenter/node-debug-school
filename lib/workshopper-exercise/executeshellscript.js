// Copyright Joyent, Inc. and other node-debug-school contributors. All
// rights reserved. Permission is hereby granted, free of charge, to any
// person obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var exec = require('child_process').exec;
var fs   = require('fs');

var async = require('async');
var debug = require('debug')('debug-school');

function executeshellscript (exercise, options, checkCallback) {

  if (typeof options === 'function') {
    checkCallback = options;
    options = null;
  }

  function processor (mode, callback) {
    var submission = this.args[0]

    function checkSubmission(err, stdout, stderr) {
      checkCallback(err, stdout, stderr, callback);
    }

    var tasks = {};

    if (options.preScript) {
      tasks.preScript = fs.readFile.bind(global, options.preScript);
    }

    tasks.submission = fs.readFile.bind(global, submission);

    async.parallel(tasks, function allScriptsRead(err, results) {
      if (!err) {
        var scriptContent = '';

        if (results.preScript) {
          scriptContent += '\n' + results.preScript.toString();
        }

        if (options.preCommands) {
          scriptContent += '\n' + options.preCommands.join(';')
        }

        scriptContent += '\n' + results.submission.toString();

        if (options.postCommands) {
          scriptContent += '\n' + options.postCommands.join(';');
        }

        debug('Executing script:');
        debug(scriptContent);
        exec(scriptContent, checkSubmission);
      } else {
        return callback(err);
      }
    });
  }

  exercise.addProcessor(processor);
  return exercise;
}

module.exports = executeshellscript;
