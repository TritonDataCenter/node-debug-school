var debug = require('debug')('debug-school');

  function getCoreFilesPathPatternSunOS(callback) {
    var exec = require('child_process').exec;
    exec('coreadm', function onCoreAdmExec(err, stdout, stderr) {
      if (err) {
        return callback(err);
      }

      if (!stdout) {
        return callback(new Error("Expected output from coreadm, but got nothing"));
      }

      debug('coreadm output:');
      debug(stdout);

      var lines = stdout.split('\n');
      if (!lines) {
        return callback(new Error("Invalid output from coreadm"));
      }

      var coreFilesPattern;
      lines.forEach(function(line) {
        var keyValue = line.split(':');
        if (!keyValue) {
          return callback(new Error("Invalid output from coreadm"));
        }

        if (keyValue[0].match(/global core file pattern/)) {
          return callback(null, keyValue[1].trim());
        }
      });
    });
  }

  function getCoreFilesPathPatternDarwin(callback) {
    process.nextTick(function() {
      return callback(null, '/cores/core.%p');
    });
  }

if (process.platform === 'sunos') {
  exports.getCoreFilesPathPattern = getCoreFilesPathPatternSunOS;
}

if (process.platform === 'darwin') {
  exports.getCoreFilesPathPattern = getCoreFilesPathPatternDarwin;
}
