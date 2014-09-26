#!/usr/bin/env node

var exercise     = require('workshopper-exercise')();
var cmdargscheck = require('../../lib/workshopper-exercise/cmdargscheck');

var path     = require('path');
var util     = require('util');
var debug    = require('debug')('debug-school');

var config           = require('../../config.js');
var dumpCore         = require('../../lib/core/dumpcore.js');
var cleanupCoreFiles = require('../../lib/core/cleanupcorefiles.js');

exercise.addPrepare(function(callback) {
  dumpCore(path.join(__dirname, 'well-done-well-done.js'),
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
exercise.submissionName = 'filename.js';

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

  if (args[0] === 'well-done-well-done.js') {
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
