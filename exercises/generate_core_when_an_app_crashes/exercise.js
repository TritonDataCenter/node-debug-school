#!/usr/bin/env node

var util = require('util');
var path = require('path');
var fs   = require('fs');

var exercise = require('workshopper-exercise')();
var debug    = require('debug')('debug-school');
var xtend    = require('xtend');
var async    = require('async');
var glob     = require('glob');

var executeshellscript = require('../../lib/workshopper-exercise/executeshellscript');
var isCoreFile         = require('../../lib/core/iscorefile.js');
var coreConfig         = require('../../lib/core/coreconfig.js');

function disableCoreDumpsGeneration(originalCoreFilesConfig, callback) {
  if (process.platform === 'sunos') {
    debug('Disabling core dumps generation...');

    var coreFilesConfig = xtend(originalCoreFilesConfig, {});

    coreFilesConfig.globalCoreDumps = false;
    coreFilesConfig.perProcessCoreDumps = false;
    coreFilesConfig.globalPattern = '/foo/bar';

    coreConfig.applyConfig(coreFilesConfig, function coreConfigApplied(err) {
      if (!err) {
        debug('Core dumps generation disabled successfuly!');
      } else {
        debug('Could not disable core dumps generation, reason: ' + err);
      }

      return callback(err);
    });
  } else {
    return callback();
  }
}

exercise.addSetup(function setup(mode, callback) {
  if (mode === 'verify') {
    coreConfig.getCoreFilesConfig(function(err, originalCoreFilesConfig) {
      console.log('orig core files conf: ', originalCoreFilesConfig);
      exercise.originalCoreFilesConfig = originalCoreFilesConfig;
      disableCoreDumpsGeneration(originalCoreFilesConfig, callback);
    });
  }
});

var TARGET_CORES_DIR = '/cores';

function cleanTargetCoresDir(callback) {
  var cleanCoreFilesErrors = [];
  glob(path.join(TARGET_CORES_DIR, '*'), function(err, files) {
    async.each(files || [], function (file, fileRemovalDone) {
      fs.unlink(file, function onUnlink(err) {
        if (err) {
          cleanCoreFilesErrors.push(err);
        }

        return fileRemovalDone(err);
      });
    }, function allFilesRemoved(err) {
      return callback(err);
    });
  });
}

exercise.addCleanup(function cleanup(mode, pass, callback) {
  debug('Cleaning up...');

  async.parallel([
    coreConfig.applyConfig.bind(global, exercise.originalCoreFilesConfig),
    cleanTargetCoresDir
  ], function cleanupDone(err) {
    return callback(err);
  });
});

function checkSolution(err, stdout, stderr, callback) {
  debug('checking solution...');
  debug('stdout: ' + stdout);
  debug('stderr: ' + stderr);

  var nodeAppPid = stdout >>> 0;
  var candidateCoreFilePath = path.join(TARGET_CORES_DIR,
                                        util.format('core.%d', nodeAppPid));
  return isCoreFile(candidateCoreFilePath, callback);
}

var preCommands = ['ulimit -Sc 0 >/dev/null 2>&1'];
exercise = executeshellscript(exercise, preCommands, checkSolution);

exercise.submissionName = 'shell-script.sh';

exercise.additionalVariables = {}
exercise.additionalVariables.coresDirectory = TARGET_CORES_DIR;

module.exports = exercise;
