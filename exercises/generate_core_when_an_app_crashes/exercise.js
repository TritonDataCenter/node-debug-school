#!/usr/bin/env node

var util = require('util');

var exercise = require('workshopper-exercise')();
var debug    = require('debug')('debug-school');

var executeshellscript = require('../../lib/workshopper-exercise/executeshellscript');
var isCoreFile         = require('../../lib/core/iscorefile.js');

var preCommands = ['ulimit -Sc 0 >/dev/null 2>&1'];
if (process.platform === 'sunos') {
    preCommands.push('coreadm -d process >/dev/null 2>&1');
    preCommands.push('coreadm -d global >/dev/null 2>&1');
    preCommands.push('coreadm -g /foo/bar >/dev/null 2>&1');
}

function checkSolution(err, stdout, stderr, callback) {
  debug('checking solution...');
  debug('stdout: ' + stdout);
  debug('stderr: ' + stderr);

  var nodeAppPid = stdout >>> 0;
  return isCoreFile(util.format('/cores/core.%d', nodeAppPid), callback);
}

exercise = executeshellscript(exercise, preCommands, checkSolution);
exercise.submissionName = 'shell-script.sh';

module.exports = exercise;
