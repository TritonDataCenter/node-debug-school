#!/usr/bin/env node

var exercise         = require('workshopper-exercise')();
var filecontentcheck = require('../../lib/workshopper-exercise/filecontentcheck');

var path     = require('path');
var util     = require('util');
var debug    = require('debug')('debug-school');
var mv       = require('mv');

var config = require('../../config.js');
var dumpCore = require('../../lib/core/dumpcore.js');

var common = require('./common.js');

exercise.addPrepare(function(callback) {
    dumpCore(path.join(__dirname, 'node-script-that-aborts.js'), function(err, coreFilePath) {
      debug(util.format('core dumped at path [%s]', coreFilePath));

      if (!err) {
        var coreFileName = path.basename(coreFilePath);
        var dstCoreFilePath = path.join(config.CORE_FILES_DIRECTORY,
                                        coreFileName);
        mv(coreFilePath, dstCoreFilePath, {mkdirp: true}, function(err) {
          if (!err) {
            exercise.additionalVariables.coreFilePath = dstCoreFilePath;
          } else {
            console.error('Error when moving file from [%] to [%]:',
                          coreFilePath,
                          dstCoreFilePath,
                          err);
          }

          return callback(err);
        });
      }
    }
   );
});

exercise.additionalVariables = {};
exercise.submissionName = 'solution.txt';

exercise = filecontentcheck(exercise, function(fileContent, callback) {
  debug('checking solution...');

  if (!data) {
    debug('solution is empty!');
    return process.nextTick(function() {
      callback(null, false);
    });
  }

  debug('file content:');
  debug(fileContent.toString());

  var lines = fileContent.split('\n');
  var total = 0;
  lines.forEach(function(line) {
    total += line >>> 0;
  });

  if (total === common.expectedTotal) {
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
