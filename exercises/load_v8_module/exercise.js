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

var exercise = require('workshopper-exercise')();
var debug    = require('debug')('debug-school');

var filecontentcheck = require('../../lib/workshopper-exercise/filecontentcheck');
var mdb = require('../../lib/mdb/mdb.js');

exercise = filecontentcheck(exercise, function(fileContent, callback) {
  debug('checking solution...');
  if (!fileContent) {
    debug('solution is empty!');
    return process.nextTick(function() {
      callback(null, false);
    });
  }

  debug('file content:');
  debug(fileContent.toString());

  if (mdb.v8ModuleLoaded(fileContent.toString())) {
    return process.nextTick(function() {
      callback(null, true);
    });
  } else {
    return process.nextTick(function() {
      callback(null, false);
    });
  }
});

exercise.submissionName = 'solution.txt';

module.exports = exercise
