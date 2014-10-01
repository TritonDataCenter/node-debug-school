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

var exec  = require('child_process').exec;
var debug = require('debug')('debug-school');
var util  = require('util');
var assert = require('assert');

function runFile(filePath, callback) {
  assert(typeof filePath === 'string', 'filePath must be a string');
  assert(typeof callback === 'function', 'callback must be a function');

  exec(util.format('file %s', filePath), function(err, stdout, stderr) {
    if (err) {
      debug('file Error: ' + err);
    }

    debug('file STDOUT: ' + stdout);
    debug('file STDERR: ' + stderr);

    return callback(err, stdout, stderr);
  });
}

function isCoreFileSunOS(filePath, callback) {
  runFile(filePath, function onFileCommandDone(err, stdout, stderr) {
    var isCoreFile = false;
    if (stdout && stdout.match(/ELF.*core file/)) {
      isCoreFile = true;
    }

    return callback(err, isCoreFile);
  });
}

function isCoreFileDarwin(filePath, callback) {
  runFile(filePath, function onFileCommandDone(err, stdout, stderr) {
    var isCoreFile = false;
    if (stdout && stdout.match(/Mach-O.*core/)) {
      isCoreFile = true;
    }

    return callback(err, isCoreFile);
  });
}

if (process.platform === 'darwin') {
  module.exports = isCoreFileDarwin;
}

if (process.platform === 'sunos') {
  module.exports = isCoreFileSunOS;
}

