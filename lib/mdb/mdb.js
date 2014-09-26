var assert = require('assert');

exports.v8ModuleLoaded = function v8ModuleLoaded(output) {
  assert(typeof output === 'string', 'output needs to be a string');

  var lines = output.split('\n');
  if (lines && lines[0].trim().match(/V8 version: \d+\.\d+\.\d+/)) {
    return true;
  }

  return false;
}
