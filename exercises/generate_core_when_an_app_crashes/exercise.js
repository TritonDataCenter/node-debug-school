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
if (process.getuid() === 0) {
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
}

var TARGET_CORES_DIR = './my-cores';

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

if (process.getuid() === 0) {
exercise.addCleanup(function cleanup(mode, pass, callback) {
  debug('Cleaning up...');

  async.parallel([
    coreConfig.applyConfig.bind(global, exercise.originalCoreFilesConfig),
    cleanTargetCoresDir
  ], function cleanupDone(err) {
    return callback(err);
  });
});
}

function showHints(outputLines, callback) {
  var msg;

  console.log(chalk.bold.blue('# HINTS'));
  msg = 'Following are some hints to help you pass this exercise:';
  console.log(chalk.blue(msg));

  var nbExpectedOutputLines = 3 + (process.platform === 'sunos' ? 1 : 0);
  debug('Output lines expected: ' + nbExpectedOutputLines);

  if (!outputLines || outputLines.length !== nbExpectedOutputLines) {
    msg = "* It seems that your script doesn't follow the instructions " +
          "regarding its output format, please read the instructions " +
          "carefully again.";
    console.log(chalk.blue(msg));
  }

  var ulimitResult = outputLines[1].split(':')[1];
  if (ulimitResult !== 'unlimited') {
    msg = '* Core dumps are limited in size by ulimit. You might want to ' +
          'disable this limit within your solution script. See man ulimit.';
    console.log(chalk.blue(msg));
  }

  coreConfig.getCoreFilesConfig(function (err, config) {
    if (err) {
      return callback(err);
    }

    debug('core files config: ' + util.inspect(config));

    if (!config.perProcessCoreDumps && !config.globalCoreDumps) {
      msg = '* Core dumps are not enabled by your shell script, ' +
            'but should be.';
      if (process.platform === 'sunos') {
        msg += ' See man coreadm.';
      } else if (process.platform === 'darwin') {
        msg += ' See man sysctl and sysctl -A | grep core.';
      }

      console.log(chalk.blue(msg));
    }

    var pidPattern = '%p';
    if (process.platform === 'darwin') {
      pidPattern = '%P';
    }

    var desiredCoreFilesNames = 'core.' + pidPattern;
    var desiredCoreFilesPattern = path.join(TARGET_CORES_DIR, desiredCoreFilesNames);

    // Check coreadm $$ output from shell script post commands
    // to see if the student set the correct pattern for per-process
    // core dumps
    if (process.platform === 'sunos') {
      var perProcessCorePattern = outputLines[2].split(':')[1];
      if (perProcessCorePattern != desiredCoreFilesPattern) {
        msg = '* Per-process core dumps pattern should put core files in ' +
              'the directory ' + TARGET_CORES_DIR + ' with file names ' +
              'following the pattern core.pid. See man coreadm.';
        console.log(chalk.blue(msg));
      }
    } else {
      if (config.globalPattern !== desiredCoreFilesPattern) {
        msg = '* Global core dumps pattern should put core files in files ' +
              ' following the following pattern: ' + desiredCoreFilesPattern
        if (process.platform === 'darwin') {
          msg += ' See man sysctl and systctl -A | grep core.';
        }

        console.log(chalk.blue(msg));
      }
    }

    return callback();
  });
}

function checkSolution(err, stdout, stderr, callback) {
  debug('checking solution...');
  debug('stdout: ' + stdout);
  debug('stderr: ' + stderr);

  var outputLines = stdout.split('\n');
  var nbExpectedOutputLines = 3 + (process.platform === 'sunos' ? 1 : 0);
  debug('Output lines expected: ' + nbExpectedOutputLines);
  if (!outputLines || outputLines.length !== nbExpectedOutputLines) {
    showHints(outputLines, function(err) {
      if (err) {
        debug('Error when displaying solution hints: ' + util.inspect(err));
      }
      return callback(null, false);
    });
  } else {
    var nodeAppPid = outputLines[0] >>> 0;
    var candidateCoreFilePath = path.join(TARGET_CORES_DIR,
                                        util.format('core.%d', nodeAppPid));
    return isCoreFile(candidateCoreFilePath, function (solutionErr, coreFileValid) {
      if (!coreFileValid) {
        showHints(outputLines, function(err) {
          if (err) {
            debug('Error when displaying solution hints: ' + util.inspect(err));
          }

          return callback(solutionErr, coreFileValid);
        });
      } else {
        return callback(solutionErr, coreFileValid);
      }
    });
  }
}

var preCommands  = [];
if (process.platform === 'sunos') {
  preCommands.push('coreadm -p /foo/bar');
}
/*
 * Intentionally set core file size limit to 0 so that
 * it has to be set back to a value large enough to generate a core
 * by students.
 */
preCommands.push('ulimit -Sc 0');

var postCommands = ['echo "ulimit:`ulimit -c`"'];
if (process.platform === 'sunos') {
  postCommands.push('echo "coreadm:`coreadm $$ | cut -f 2`"');
}
postCommands.push("exit 0");

exercise = executeshellscript(exercise,
                              preCommands,
                              postCommands,
                              checkSolution);

exercise.submissionName = 'shell-script.sh';

exercise.additionalVariables = {}
exercise.additionalVariables.coresDirectory = TARGET_CORES_DIR;

module.exports = exercise;
