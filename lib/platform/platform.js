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

var dumpCore = require('../core/dumpcore.js');
var config   = require('../../config.js');
var mdb      = require('../mdb/mdb.js');

function loadMdbV8(coreFilePath, callback) {
  debug('Trying to load mdb\'s v8 module...');

  var mdbLoadV8Command = 'echo "::load v8" | mdb ' + coreFilePath;
  exec(mdbLoadV8Command, function (err, stdout, stderr) {
    debug('mdb STDERR: ' + stderr);
    debug('mdb STDOUT: ' + stdout);

    if (err) {
      debug('Error: ' + err);
      return callback(err, false);
    } else {
      return callback(err, mdb.v8ModuleLoaded(stdout.toString()));
    }
  });
}

exports.checkPlatformSupported = function checkPlatformSupported(callback) {
  if (process.platform === 'sunos') {
    var createdCoreFilePath;
    async.waterfall([
      dumpCore.bind(global, null, config.CORE_FILES_DIRECTORY),
      function (coreFilePath, callback) {
        createdCoreFilePath = coreFilePath;
        return callback(null, coreFilePath);
      },
      loadMdbV8
    ], function(err, result) {
      if (createdCoreFilePath) {
        fs.unlink(createdCoreFilePath);
      }

      return callback(err, result);
    })
  } else {
    return process.nextTick(function() {
      return callback(null, false);
    })
  }
}
