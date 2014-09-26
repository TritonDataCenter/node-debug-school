var exec = require('child_process').exec;

var async = require('async');
var debug = require('debug')('debug-school');

var dumpCore = require('../core/dumpcore.js');
var config   = require('../../config.js');
var mdb      = require('../mdb/mdb.js');

function loadMdbV8(coreFilePath, callback) {
  debug('Trying to load mdb\'s v8 module...');
  exec('echo "::load v8" | mdb ' + coreFilePath, function (err, stdout, stderr) {
    debug('mdb STDERR: ' + stderr);
    debug('mdb STDOUT: ' + stdout);

    if (err) {
      debug('Error: ' + err);
      return callback(err, false);
    } else {
      return callback(err, mdb.v8ModuleLoaded(stdout.toString()));
    }
  });
}

exports.checkPlatformSupported = function checkPlatformSupported(callback) {
  if (process.platform === 'sunos') {
    async.waterfall([
      dumpCore.bind(global, null, config.CORE_FILES_DIRECTORY),
      loadMdbV8
    ], function(err, result) {
      return callback(err, result);
    })
  } else {
    return process.nextTick(function() {
      return callback(null, false);
    })
  }
}
