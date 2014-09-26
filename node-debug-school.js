#!/usr/bin/env node

/*
 * Because workshopper hard codes command line arguments handling,
 * we need to to our own and remove any extra command line arguments we support
 * before workshopper parses the command line
 */
var argv = require('minimist')(process.argv.slice(2));
var devMode = false;
if (argv.dev) {
  devMode = true;
  process.argv.splice(process.argv.indexOf('--dev'), 1);
}

var path        = require('path');

var workshopper = require('workshopper');

var menu        = require('./exercises/menu');
var platform    = require('./lib/platform/platform.js');
var progressMsg = require('./lib/progress/progressmsg.js');

var subtitle = '\x1b[23mSelect an exercise and hit \x1b[3mEnter\x1b[23m to begin';

function fullPath(relPath) {
  return path.join(__dirname, relPath);
}

function startWorkshop() {
  workshopper({
      name        : 'node-debug-school'
    , title       : 'NODE.JS DEBUGGING ON STEROIDS'
    , subtitle    : subtitle
    , exerciseDir : fullPath('./exercises/')
    , appDir      : __dirname
    , helpFile    : fullPath('help.txt')
    , footerFile  : fullPath('footer.md')
  });
}


if (devMode) {
  startWorkshop();
} else {
  var platformCheckMsg = 'Checking if platform is supported';
  var platformCheckProgress = progressMsg.startProgressMsg(platformCheckMsg,
                                                         300);
  platform.checkPlatformSupported(function platformCheckDone(err, platformSupported) {
    progressMsg.stopProgressMsg(platformCheckProgress);

    if (platformSupported) {
      startWorkshop();
    } else {
      console.error('Sorry, your current platform is not supported.');
    }
  });
}
