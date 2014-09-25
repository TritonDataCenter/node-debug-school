#!/usr/bin/env node

var exercise        = require('workshopper-exercise')();
var filecustomcheck = require('../../lib/workshopper-exercise/filecustomcheck');

var debug    = require('debug')('debug-school');

var isCoreFile = require('../../lib/core/iscorefile.js');

exercise = filecustomcheck(exercise, function(filePath, callback) {
  debug('checking solution...');
  debug('file path: ' + filePath);

  return isCoreFile(filePath, callback);
});

exercise.submissionName = 'corefile';

module.exports = exercise
