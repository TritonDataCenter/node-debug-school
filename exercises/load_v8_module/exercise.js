#!/usr/bin/env node

var exercise = require('workshopper-exercise')();
var debug    = require('debug')('debug-school');

var filecontentcheck = require('../../lib/workshopper-exercise/filecontentcheck');
var mdb = require('../../lib/mdb/mdb.js');

exercise = filecontentcheck(exercise, function(fileContent, callback) {
  debug('checking solution...');
  if (!fileContent) {
    debug('solution is empty!');
    return process.nextTick(function() {
      callback(null, false);
    });
  }

  debug('file content:');
  debug(fileContent.toString());

  if (mdb.v8ModuleLoaded(fileContent.toString())) {
    return process.nextTick(function() {
      callback(null, true);
    });
  } else {
    return process.nextTick(function() {
      callback(null, false);
    });
  }
});

exercise.submissionName = 'solution.txt';

module.exports = exercise
