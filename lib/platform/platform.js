var exec = require('child_process').exec;

var dumpCore = require('../core/dumpcore.js');
var config   = require('../../config.js');
var mdb      = require('../mdb/mdb.js');

function loadMdbV8(coreFilePath, callback) {
  exec('echo "::load v8" | mdb ' + coreFilePath, function (err, stdout, stderr) {
    if (err) {
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
