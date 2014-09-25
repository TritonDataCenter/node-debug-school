#!/usr/bin/env node

var exercise         = require('workshopper-exercise')();
var filecontentcheck = require('../../lib/workshopper-exercise/filecontentcheck');

var debug    = require('debug')('debug-school');

exercise = filecontentcheck(exercise, function(fileContent, callback) {
  debug('checking solution...');
  if (!fileContent) {
    debug('solution is empty!');
    return process.nextTick(function() {
      callback(null, true);
    });
  }

  debug('file content:');
  debug(fileContent.toString());

  var lines = fileContent.toString().split('\n');
  if (lines && lines[0].trim().match(/V8 version: \d+\.\d+\.\d+/)) {
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
