var exec = require('child_process').exec;
var fs   = require('fs');

var async = require('async');
var debug = require('debug')('debug-school');

var dumpCore = require('../core/dumpcore.js');
var config   = require('../../config.js');
var mdb      = require('../mdb/mdb.js');

function loadMdbV8(coreFilePath, callback) {
  debug('Trying to load mdb\'s v8 module...');

  var mdbLoadV8Command = 'echo "::load v8" | mdb ' + coreFilePath;
  exec(mdbLoadV8Command, function (err, stdout, stderr) {
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
    var createdCoreFilePath;
    async.waterfall([
      dumpCore.bind(global, null, config.CORE_FILES_DIRECTORY),
      function (coreFilePath, callback) {
        createdCoreFilePath = coreFilePath;
        return callback(null, coreFilePath);
      },
      loadMdbV8
    ], function(err, result) {
      if (createdCoreFilePath) {
        fs.unlink(createdCoreFilePath);
      }

      return callback(err, result);
    })
  } else {
    return process.nextTick(function() {
      return callback(null, false);
    })
  }
}
