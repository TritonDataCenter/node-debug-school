#!/usr/bin/env node

var exercise     = require('workshopper-exercise')();
var cmdargscheck = require('../../lib/workshopper-exercise/cmdargscheck');

var path     = require('path');
var util     = require('util');
var debug    = require('debug')('debug-school');

var config = require('../../config.js');
var dumpCore = require('../../lib/core/dumpcore.js');

exercise.addPrepare(function(callback) {
  dumpCore(path.join(__dirname, 'node-script-that-aborts.js'),
           config.CORE_FILES_DIRECTORY,
           function onCoreDumped(err, dstCoreFilePath) {
             if (!err) {
               exercise.additionalVariables.coreFilePath = dstCoreFilePath;
             }
             return callback(err);
           });
});

exercise.additionalVariables = {};
exercise.submissionName = 'max-value';

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

  if (args[0] >>> 0 === 9) {
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
