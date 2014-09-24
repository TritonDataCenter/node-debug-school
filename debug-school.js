#!/usr/bin/env node

var   workshopper = require('workshopper')
    , path        = require('path')
    , menu        = require('./exercises/menu')
    , name        = 'node-debug-school'
    , title       = 'NODE.JS DEBUGGING ON STEROIDS'
    , subtitle    = '\x1b[23mSelect an exercise and hit \x1b[3mEnter\x1b[23m to begin'


function fullPath(relPath) {
  return path.join(__dirname, relPath)
}

workshopper({
    name        : name
  , title       : title
  , subtitle    : subtitle
  , exerciseDir : fullPath('./exercises/')
  , appDir      : __dirname
  , helpFile    : fullPath('help.txt')
  , footerFile  : fullPath('footer.md')
})
