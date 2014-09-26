var debug  = require('debug')('debug-school');
var rimraf = require('rimraf');

var config = require('../../config.js');

module.exports = function cleanupCoreFiles(mode, pass, callback) {
  if (mode === 'verify' && pass) {
    debug('Cleaning up core files directory...');
    return rimraf(config.CORE_FILES_DIRECTORY, callback);
  }

  return callback(null);
};
