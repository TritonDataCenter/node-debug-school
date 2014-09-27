#!/usr/bin/env node

var util = require('util');

var exercise = require('workshopper-exercise')();
var debug    = require('debug')('debug-school');
var xtend    = require('xtend');

var executeshellscript = require('../../lib/workshopper-exercise/executeshellscript');
var isCoreFile         = require('../../lib/core/iscorefile.js');
var coreConfig         = require('../../lib/core/coreconfig.js');

exercise.addSetup(function setup(mode, callback) {
  if (mode === 'verify') {
    coreConfig.getCoreFilesConfig(function(err, originalCoreFilesConfig) {
      exercise.originalCoreFilesConfig = originalCoreFilesConfig;
      var coreFilesConfig = xtend(originalCoreFilesConfig, {});
      if (process.platform === 'sunos') {
        debug('Disabling core dumps generation...');

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
      }
    });
  }
});

exercise.addCleanup(function cleanup(mode, pass, callback) {
  coreConfig.applyConfig(exercise.originalCoreFilesConfig);
});

function checkSolution(err, stdout, stderr, callback) {
  debug('checking solution...');
  debug('stdout: ' + stdout);
  debug('stderr: ' + stderr);

  var nodeAppPid = stdout >>> 0;
  return isCoreFile(util.format('/cores/core.%d', nodeAppPid), callback);
}

var preCommands = ['ulimit -Sc 0 >/dev/null 2>&1'];
exercise = executeshellscript(exercise, preCommands, checkSolution);
exercise.submissionName = 'shell-script.sh';

module.exports = exercise;
