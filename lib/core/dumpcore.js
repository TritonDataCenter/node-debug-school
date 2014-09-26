var spawn = require('child_process').spawn;
var util  = require('util');
var path  = require('path');

var debug = require('debug')('debug-school');
var async = require('async');
var mv    = require('mv');

var coreConfig  = require('./coreconfig.js')
var progressMsg = require('../progress/progressmsg.js');

var CORE_DUMPS_PROGRESS_MSG   = 'Please wait while a core dump is being generated';
var CORE_DUMPS_PROGRESS_DELAY = 300;

function generateCoreDump(scriptPath, coreFilesPattern, callback) {
  var nodeInvocation = 'node --abort-on-uncaught-exception ';
  if (scriptPath) {
    nodeInvocation += scriptPath;
  } else {
    nodeInvocation += "-e 'console.log(process.pid); undef();'"
  }

  var args = [ '-c',
    'ulimit -c unlimited; ' + nodeInvocation
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
}

function moveCoreFileToDirectory(destDirectory, coreFilePath, callback) {
  debug(util.format('core dumped at path [%s]', coreFilePath));

  var coreFileName = path.basename(coreFilePath);
  var dstCoreFilePath = path.join(destDirectory,
                                  coreFileName);
  mv(coreFilePath, dstCoreFilePath, {mkdirp: true}, function(err) {
    if (err) {
      console.error('Error when moving file from [%] to [%]:',
                    coreFilePath,
                    dstCoreFilePath,
                    err);
    }

    return callback(err, dstCoreFilePath);
  });
}

module.exports = function dumpCore(scriptPath, destDirectory, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  var coreDumpProgressMsg;
  if (options && options.progress) {
    coreDumpProgressMsg = progressMsg.startProgressMsg(CORE_DUMPS_PROGRESS_MSG,
                                                       CORE_DUMPS_PROGRESS_DELAY);
  }

  async.waterfall([
    coreConfig.getCoreFilesPathPattern.bind(global),
    generateCoreDump.bind(global, scriptPath),
    moveCoreFileToDirectory.bind(global, destDirectory)
  ], function allDone(err, result) {
    if (coreDumpProgressMsg) {
      progressMsg.stopProgressMsg(coreDumpProgressMsg);
    }
    if (err) {
      debug('Error when dumping core: ' + err);
    }
    return callback(err, result);
  });
}
