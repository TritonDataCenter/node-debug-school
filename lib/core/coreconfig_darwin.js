var exec = require('child_process').exec;

var debug = require('debug')('debug-school');
var async = require('async');

function getCoreFilesPattern(callback) {
  var sysctlCmd = 'sysctl kern.corefile';
  debug('Executing ' + sysctlCmd + '...');
  exec(sysctlCmd, function (err, stdout, stderr) {
    var pattern;

    debug(sysctlCmd + ' STDOUT ' + stdout);
    debug(sysctlCmd + ' STDERR ' + stderr);

    if (stdout) {
      pattern = stdout.split(':')[1].trim();
    }

    return callback(err, pattern);
  });
}

function getGlobalCoreDumpsEnabled(callback) {
  exec('sysctl kern.coredump', function (err, stdout, stderr) {
    var globalCoreDumpsEnabled = 0;
    if (stdout) {
      globalCoreDumpsEnabled = stdout.split(':')[1].trim();
    }

    return callback(err, globalCoreDumpsEnabled);
  })
}

function getCoreFilesConfigDarwin(callback) {
  async.parallel({
      coreFilePattern: getCoreFilesPattern,
      coreDumpsEnabled: getGlobalCoreDumpsEnabled
    }, function getGoreFilesConfigDone(err, results) {
      if (err) {
        return callback(err);
      }

      return callback(null, {
        globalPattern       : results.coreFilePattern,
        globalCoreDumps     : results.coreDumpsEnabled,
        perProcessCoreDumps : results.coreDumpsEnabled
      });
    });
}

function applyConfigDarwin(coreFilesConfig, callback) {
  return callback();
}

module.exports = {
  getCoreFilesConfig: getCoreFilesConfigDarwin,
  applyConfig       : applyConfigDarwin
}
