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

var debug = require('debug')('debug-school');
var async = require('async');

function getCoreFilesPattern(callback) {
  var sysctlCmd = 'sysctl kern.corefile';
  debug('Executing ' + sysctlCmd + '...');
  exec(sysctlCmd, function (err, stdout, stderr) {
    var pattern;

    debug(sysctlCmd + ' STDOUT ' + stdout);
    debug(sysctlCmd + ' STDERR ' + stderr);

    if (stdout) {
      pattern = stdout.split(':')[1].trim();
    }

    return callback(err, pattern);
  });
}

function getGlobalCoreDumpsEnabled(callback) {
  exec('sysctl kern.coredump', function (err, stdout, stderr) {
    var globalCoreDumpsEnabled = 0;
    if (stdout) {
      globalCoreDumpsEnabled = stdout.split(':')[1].trim();
    }

    return callback(err, globalCoreDumpsEnabled);
  })
}

function getCoreFilesConfigDarwin(callback) {
  async.parallel({
      coreFilePattern: getCoreFilesPattern,
      coreDumpsEnabled: getGlobalCoreDumpsEnabled
    }, function getGoreFilesConfigDone(err, results) {
      if (err) {
        return callback(err);
      }

      return callback(null, {
        globalPattern       : results.coreFilePattern,
        globalCoreDumps     : results.coreDumpsEnabled,
        perProcessCoreDumps : results.coreDumpsEnabled
      });
    });
}

function applyConfigDarwin(coreFilesConfig, callback) {
  return callback();
}

module.exports = {
  getCoreFilesConfig: getCoreFilesConfigDarwin,
  applyConfig       : applyConfigDarwin
}
