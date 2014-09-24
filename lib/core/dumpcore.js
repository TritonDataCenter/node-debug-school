var spawn = require('child_process').spawn;
var util  = require('util');
var path  = require('path');
var debug = require('debug')('debug-school');

var coreConfig = require('./coreconfig.js')

module.exports = function dumpCore(scriptPath, callback) {
  coreConfig.getCoreFilesPathPattern(function (err, coreFilesPattern) {
    if (err) {
      return callback(err);
    }

    var args = [ '-c',
      'ulimit -c 50000000; node --abort-on-uncaught-exception ' + scriptPath
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

      var coreFilePath = coreFilesPattern.replace('%p', actualNodeProcessPid);
      coreFilePath = coreFilePath.replace('%f', 'node');

      return callback(null, coreFilePath);
    });
  });
}
