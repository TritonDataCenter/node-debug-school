#!/usr/bin/env node

var path     = require('path');
var util     = require('util');

var exercise = require('workshopper-exercise')();
var debug    = require('debug')('debug-school');

var filecontentcheck = require('../../lib/workshopper-exercise/filecontentcheck');
var config           = require('../../config.js');
var dumpCore         = require('../../lib/core/dumpcore.js');
var cleanupCoreFiles = require('../../lib/core/cleanupcorefiles.js');

exercise.addPrepare(function prepare(callback) {
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
exercise.submissionName = 'callstack.txt';

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

  var requiredFunctionCall = 'Module._compile';
  if (fileContent.toString().indexOf(requiredFunctionCall) >= 0) {
    debug('Found ' + requiredFunctionCall);
    return process.nextTick(function() {
      callback(null, true);
    });
  } else {
    debug(requiredFunctionCall + ' not found!');
    return process.nextTick(function() {
      callback(null, false);
    });
  }
});

module.exports = exercise
