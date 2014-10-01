// Copyright Joyent, Inc. and other node-debug-school contributors. All
// rights reserved. Permission is hereby granted, free of charge, to any
// person obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var assert = require('assert');
var exec   = require('child_process').exec;

var async = require('async');
var debug = require('debug')('debug-school');
var xtend = require('xtend');

function getCoreAdmGlobalConfig(callback) {
  exec('coreadm', function onCoreAdmExec(err, stdout, stderr) {
    if (err) {
      return callback(err);
    }

    if (!stdout) {
      return callback(new Error("Expected output from coreadm, but got nothing"));
    }

    debug('coreadm STDOUT:');
    debug(stdout);
    debug('coreadm STDERR:');
    debug(stderr);

    var lines = stdout.split('\n');
    if (!lines) {
      if (callback) {
        callback(new Error("Invalid output from coreadm"));
      }

      return;
    }

    var coreAdmConfig = {};
    lines.some(function(line) {
      var keyValue = line.split(':');

      if (keyValue.length !== 2) {
        return false;
      }

      var key = keyValue[0].trim();
      var value = keyValue[1].trim();

      if (key.match(/global core file pattern/)) {
        coreAdmConfig.globalPattern = value.trim();
      } else if (key.match(/global core dumps/)) {
        coreAdmConfig.globalCoreDumps = value.trim() === 'enabled';
      } else if (key.match(/per-process core dumps/)) {
        coreAdmConfig.perProcessCoreDumps = value.trim() === 'enabled';
      }
    });

    if (callback) {
      callback(null, coreAdmConfig);
    }

    return;
  });
}

function getUlimitConfig(callback) {
  exec('ulimit -c', function OnUlimitDone(err, stdout, stderr) {
    if (err) {
      return callback(err);
    } else {
      var ulimitConfig = {};
      if (stdout) {
        ulimitConfig.coreFilesSizeLimit = stdout.replace('\n', '');
      }
      return callback(null, ulimitConfig);
    }
  })
}

function getCoreFilesConfigSunOS(callback) {
  async.parallel({
    coreAdmConfig: getCoreAdmGlobalConfig,
    ulimitConfig: getUlimitConfig
  }, function (err, results) {
    var coreFilesConfig;
    if (!err) {
      if (results.coreAdmConfig) {
        coreFilesConfig = xtend(coreFilesConfig, results.coreAdmConfig);
      }

      if (results.ulimitConfig) {
        coreFilesConfig = xtend(coreFilesConfig, results.ulimitConfig);
      }
    }

    return callback(err, coreFilesConfig);
  });
}

function enableGlobalCoreDumpsSunOS(callback) {
  var coreAdmCmd = 'coreadm -e global';
  exec(coreAdmCmd, function onCoreAdmDone(err, stdout, stderr) {
    return callback(err);
  });
}

function disableGlobalCoreDumpsSunOS(callback) {
  var coreAdmCmd = 'coreadm -d global';
  exec(coreAdmCmd, function onCoreAdmDone(err, stdout, stderr) {
    return callback(err);
  });
}

function setGlobalCoreDumpsPatternSunOS(pattern, callback) {
  assert(typeof pattern === 'string', 'global core files pattern must be a string');
  var coreAdmCmd = 'coreadm -g ' + pattern;
  exec(coreAdmCmd, function onCoreAdmDone(err, stdout, stderr) {
    return callback(err);
  });
}

function applyGlobalCoreDumpsConfigSunOS(coreFilesConfig, callback) {
  debug('Applying global core dumps config...');

  var tasks;
  if (coreFilesConfig.globalCoreDumps) {
    tasks = [ enableGlobalCoreDumpsSunOS ];
  } else {
    tasks = [ disableGlobalCoreDumpsSunOS ];
  }

  tasks.push(setGlobalCoreDumpsPatternSunOS.bind(global,
                                                 coreFilesConfig.globalPattern));
  async.series(tasks, callback);
}

function applyPerProcessCoreDumpsConfigSunOS(coreFilesConfig, callback) {
  debug('Applying per process core dumps config...');

  var coreAdmCmd = 'coreadm -d process';
  if (coreFilesConfig.perProcessCoreDumps) {
    coreAdmCmd = 'coreadm -e process';
  }

  exec(coreAdmCmd, callback);
}

function applyConfigSunOS(coreFilesConfig, callback) {
  debug('Applying core files config:');
  debug(coreFilesConfig);

  async.series([
    applyGlobalCoreDumpsConfigSunOS.bind(global, coreFilesConfig),
    applyPerProcessCoreDumpsConfigSunOS.bind(global, coreFilesConfig)
  ], function coreFilesConfigApplied(err, results) {
    if (callback) {
      return callback(err);
    }
  });
}

module.exports = {
  getCoreFilesConfig: getCoreFilesConfigSunOS,
  applyConfig       : applyConfigSunOS,
}
