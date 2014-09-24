#!/usr/bin/env node

var exercise = require('workshopper-exercise')();
var path     = require('path');
var mv       = require('mv');

var config = require('../../config.js');
var dumpCore = require('../../lib/dumpcore.js');

exercise.addPrepare(function(callback) {
    dumpCore(path.join(__dirname, 'node-script-that-aborts.js'), function(err, coreFilePath) {
      if (!err) {
        var coreFileName = path.basename(coreFilePath);
        var dstCoreFilePath = path.join(config.CORE_FILES_DIRECTORY,
                                        coreFileName);
        mv(coreFilePath, dstCoreFilePath, {mkdirp: true}, function(err) {
          if (!err) {
            exercise.additionalVariables.coreFilePath = dstCoreFilePath;
          }

          return callback(err);
        });
      }
    }
   );
});

exercise.additionalVariables = {};

module.exports = exercise
