var assert = require('assert');
var exec   = require('child_process').exec;

var async = require('async');
var debug = require('debug')('debug-school');

  function getCoreFilesConfigSunOS(callback) {
    var exec = require('child_process').exec;
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

      var coreFilesConfig = {};
      lines.some(function(line) {
        var keyValue = line.split(':');
        
        if (keyValue.length !== 2) {
          return false;
        }
 
        var key = keyValue[0].trim();
        var value = keyValue[1].trim();

        if (key.match(/global core file pattern/)) {
          coreFilesConfig.globalPattern = value.trim();
        } else if (key.match(/global core dumps/)) {
          coreFilesConfig.globalCoreDumps = value.trim() === 'enabled';
        } else if (key.match(/per-process core dumps/)) {
          coreFilesConfig.perProcessCoreDumps = value.trim() === 'enabled';
        }
      });
      
      if (callback) {
        callback(null, coreFilesConfig);
      }
      
      return;
    });
  }

  function enableGlobalCoreDumps(callback) {
    var coreAdmCmd = 'coreadm -e global';
    exec(coreAdmCmd, function onCoreAdmDone(err, stdout, stderr) {
      return callback(err);
    });
  }

  function disableGlobalCoreDumps(callback) {
    var coreAdmCmd = 'coreadm -d global';
    exec(coreAdmCmd, function onCoreAdmDone(err, stdout, stderr) {
      return callback(err);
    });
  }

  function setGlobalCoreDumpsPattern(pattern, callback) {
    assert(typeof pattern === 'string', 'global core files pattern must be a string');
    var coreAdmCmd = 'coreadm -g ' + pattern;
    exec(coreAdmCmd, function onCoreAdmDone(err, stdout, stderr) {
      return callback(err);
    });
  }

  function applyGlobalCoreDumpsConfig(coreFilesConfig, callback) {
    debug('Applying global core dumps config...');

    var tasks;
    if (coreFilesConfig.globalCoreDumps) {
      tasks = [ enableGlobalCoreDumps ];
    } else {
      tasks = [ disableGlobalCoreDumps ];
    }

    tasks.push(setGlobalCoreDumpsPattern.bind(global,
                                              coreFilesConfig.globalPattern));
    async.series(tasks, callback);
  }

  function applyPerProcessCoreDumpsConfig(coreFilesConfig, callback) {
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
      applyGlobalCoreDumpsConfig.bind(global, coreFilesConfig),
      applyPerProcessCoreDumpsConfig.bind(global, coreFilesConfig)
    ], function coreFilesConfigApplied(err, results) {
      if (callback) {
        return callback(err);
      }
    });
  }

  function getCoreFilesConfigDarwin(callback) {
    process.nextTick(function() {
      return callback(null, '/cores/core.%p');
    });
  }

  function applyConfigDarwin(callback) {
    return callback();
  }

if (process.platform === 'sunos') {
  exports.getCoreFilesConfig = getCoreFilesConfigSunOS;
  exports.applyConfig = applyConfigSunOS;
}

if (process.platform === 'darwin') {
  exports.getCoreFilesConfig = getCoreFilesConfigDarwin;
  exports.applyConfig = applyConfigDarwin;
}
