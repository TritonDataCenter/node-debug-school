var assert = require('assert');
var exec   = require('child_process').exec;

var async = require('async');
var debug = require('debug')('debug-school');
var xtend = require('xtend');

function getCoreAdmConfig(callback) {
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
  getCoreAdmConfig(function (err, coreAdmConfig) {
    if (!err) {
      getUlimitConfig(function (err, ulimitConfig) {
        if (!err) {
          return callback(null, xtend(coreAdmConfig, ulimitConfig));
        } else {
          return callback(err);
        }
      })
    } else {
      return callback(err);
    }
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
