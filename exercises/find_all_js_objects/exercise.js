#!/usr/bin/env node

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

var exercise     = require('workshopper-exercise')();
var cmdargscheck = require('../../lib/workshopper-exercise/cmdargscheck');

var path     = require('path');
var util     = require('util');
var debug    = require('debug')('debug-school');

var config           = require('../../config.js');
var dumpCore         = require('../../lib/core/dumpcore.js');
var cleanupCoreFiles = require('../../lib/core/cleanupcorefiles.js');

exercise.addPrepare(function(callback) {
  dumpCore(path.join(__dirname, 'node-script-that-aborts.js'),
           config.CORE_FILES_DIRECTORY,
           { progress: true },
           function onCoreDumped(err, dstCoreFilePath) {
             if (!err) {
               exercise.additionalVariables.coreFilePath = dstCoreFilePath;
             }
             return callback(err);
           });
});

exercise.addCleanup(cleanupCoreFiles);

exercise.additionalVariables = {};
exercise.submissionName = 'number';

exercise = cmdargscheck(exercise, function(args, callback) {
  debug('checking solution...');

  if (!args || args.length != 1) {
    debug('invalid number of arguments!');
    return process.nextTick(function() {
      callback(null, false);
    });
  }

  debug('cmd line argument:');
  debug(args[0]);

  if (args[0] >>> 0 === 42) {
    return process.nextTick(function() {
      callback(null, true);
    });
  } else {
    return process.nextTick(function() {
      callback(null, false);
    });
  }
});

module.exports = exercise
