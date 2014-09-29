#!/usr/bin/env node

var util = require('util');
var path = require('path');
var fs   = require('fs');

var exercise = require('workshopper-exercise')();
var debug    = require('debug')('debug-school');
var xtend    = require('xtend');
var async    = require('async');
var glob     = require('glob');
var chalk    = require('chalk');

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
      exercise.originalCoreFilesConfig = originalCoreFilesConfig;
      /*
       * Intentionally disable core dump generation so that students have
       * to use OS tools (coreadm, systcl, etc.) in their solution shell
       * script to enable it.
       */
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

function showHints() {
  coreConfig.getCoreFilesConfig(function (err, config) {
    if (err) return;

    console.log(chalk.bold.blue('# HINTS'));
    var msg = 'Following are some hints to help you pass this exercise:';
    console.log(chalk.blue(msg));

    if (!config.globalCoreDumps) {
      msg = '* Global core dumps are not enabled by your shell script, ' +
            'but should be.';
      if (process.platform === 'sunos') {
        msg += ' See man coreadm.';
      }
      console.log(chalk.blue(msg));
    }
    if (config.globalPattern != path.join(TARGET_CORES_DIR, 'core.%p')) {
      msg = '* Global core dumps pattern should put core files in /cores ' +
            'with filenames following the pattern "core.pid".' +
            ' See man coreadm.';
      console.log(chalk.blue(msg));
    }
  });
}

function checkSolution(err, stdout, stderr, callback) {
  debug('checking solution...');
  debug('stdout: ' + stdout);
  debug('stderr: ' + stderr);

  var nodeAppPid = stdout >>> 0;
  var candidateCoreFilePath = path.join(TARGET_CORES_DIR,
                                        util.format('core.%d', nodeAppPid));
  return isCoreFile(candidateCoreFilePath, function (err, coreFileValid) {
    callback(err, coreFileValid);
    if (!coreFileValid) {
      showHints();
    }
  });
}

/*
 * Intentionally set core file size limit to 0 so that
 * it has to be set back to a value large enough to generate a core
 * by students.
 */
var preCommands = ['ulimit -Sc 0 >/dev/null 2>&1'];
exercise = executeshellscript(exercise, preCommands, checkSolution);

exercise.submissionName = 'shell-script.sh';

exercise.additionalVariables = {}
exercise.additionalVariables.coresDirectory = TARGET_CORES_DIR;

module.exports = exercise;
