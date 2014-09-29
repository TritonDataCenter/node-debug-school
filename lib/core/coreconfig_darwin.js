function getCoreFilesConfigDarwin(callback) {
  process.nextTick(function() {
    return callback(null, {
      globalPattern: '/cores/core.%p',
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
