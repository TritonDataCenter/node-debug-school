var exec  = require('child_process').exec;
var debug = require('debug')('debug-school');
var util  = require('util');
var assert = require('assert');

function runFile(filePath, callback) {
  assert(typeof filePath === 'string', 'filePath must be a string');
  assert(typeof callback === 'function', 'callback must be a function');

  exec(util.format('file %s', filePath), function(err, stdout, stderr) {
    if (err) {
      debug('file Error: ' + err);
    }

    debug('file STDOUT: ' + stdout);
    debug('file STDERR: ' + stderr);

    return callback(err, stdout, stderr);
  });
}

function isCoreFileSunOS(filePath, callback) {
  runFile(filePath, function onFileCommandDone(err, stdout, stderr) {
    var isCoreFile = false;
    if (stdout && stdout.match(/ELF.*core file/)) {
      isCoreFile = true;
    }

    return callback(err, isCoreFile);
  });
}

function isCoreFileDarwin(filePath, callback) {
  runFile(filePath, function onFileCommandDone(err, stdout, stderr) {
    var isCoreFile = false;
    if (stdout && stdout.match(/Mach-O.*core/)) {
      isCoreFile = true;
    }

    return callback(err, isCoreFile);
  });
}

if (process.platform === 'darwin') {
  module.exports = isCoreFileDarwin;
}

if (process.platform === 'sunos') {
  module.exports = isCoreFileSunOS;
}

