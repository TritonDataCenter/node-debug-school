var spawn = require('child_process').spawn;
var util  = require('util');
var path  = require('path');
var debug = require('debug')('debug-school');

module.exports = function dumpCore(scriptPath, callback) {
  var args = [ '-c',
    'ulimit -c 5000000; node --abort-on-uncaught-exception ' + scriptPath
  ];
  var nodeProcess = spawn('/bin/bash', args);
  var actualNodeProcessPid;

  nodeProcess.stdout.on('data', function onData(data) {
    debug('STDOUT: ', data.toString());
    actualNodeProcessPid = data.toString();
  });

  nodeProcess.stderr.on('data', function onData(data) {
    debug('STDERR:', data.toString());
  });

  nodeProcess.on('exit', function onExit(code) {
    var err;
    if (code === 0) {
      var msg = "node process should have aborted but ran successfully";
      err = new Error(msg);
      return callback(err);
    }

    actualNodeProcessPid = actualNodeProcessPid >>> 0;
    if (actualNodeProcessPid <= 0) {
      var msg = util.format("actual node process id ([%d]) is not valid",
                            actualNodeProcessPid);
      err = new Error(msg);
      return callback(err);
    }

    var coreFileName = 'core.' + actualNodeProcessPid;
    var coreFilePath = path.join(__dirname, coreFileName);
    if (process.platform === 'darwin') {
      coreFilePath = path.join('/cores', coreFileName);
    }

    return callback(null, coreFilePath);
  });
}
