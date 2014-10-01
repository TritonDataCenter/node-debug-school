var assert = require('assert');
var exec   = require('child_process').exec;
var util   = require('util');
var path   = require('path');

var debug = require('debug')('debug-school');
var async = require('async');
var mv    = require('mv');
var mkdirp = require('mkdirp');

var progressMsg = require('../progress/progressmsg.js');

var CORE_DUMPS_PROGRESS_MSG   = 'Please wait while a core dump is being generated';
var CORE_DUMPS_PROGRESS_DELAY = 300;

function generateCoreDump(scriptPath, destDirectory, callback) {
  assert(typeof destDirectory === 'string', 'destDirectory must be a string');

  var nodeInvocation = 'node --abort-on-uncaught-exception ';
  if (scriptPath) {
    nodeInvocation += scriptPath;
  } else {
    nodeInvocation += "-e 'console.log(process.pid); undef();'"
  }
  var coreFilesPattern = path.join(destDirectory, 'core.%p');
  var enableProcessCoreDumps = 'coreadm -e process';
  var setProcessCoreDumpsPattern = 'coreadm -p ' + coreFilesPattern;
  var removePerProcessCoreSizeLimit = 'ulimit -c unlimited';
  var generateCoreCommand = [ enableProcessCoreDumps,
                              setProcessCoreDumpsPattern,
                              removePerProcessCoreSizeLimit,
                              nodeInvocation
                            ].join(';');

  var actualNodeProcessPid;
  debug('Executing shell command: ' + generateCoreCommand);
  exec(generateCoreCommand, function commandDone(err, stdout, stderr) {
    debug('STDOUT: ' + stdout);
    debug('STDERR:' + stderr);
    debug('err: ' + err);

    if (!err) {
      var msg = "node process should have aborted but ran successfully";
      err = new Error(msg);
      return callback(err);
    }

    actualNodeProcessPid = stdout >> 0;
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
  async.series([
    mkdirp.bind(global, destDirectory),
    generateCoreDump.bind(global, scriptPath, destDirectory)
  ], function coreDumped(err, results) {
    if (coreDumpProgressMsg) {
      progressMsg.stopProgressMsg(coreDumpProgressMsg);
    }
    if (err) {
      debug('Error when dumping core: ' + err);
    }
    return callback(err, results[1]);
  });
}
