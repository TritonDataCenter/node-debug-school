exports.startProgressMsg = function startProgressMsg(msg, progressDelay) {
  var nbDots = 0;
  progressDelay = progressDelay || 300;

  return setInterval(function() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(msg);

    nbDots = (nbDots + 1) % 4;
    var dots = new Array(nbDots + 1 % 4).join('.');
    process.stdout.write(dots);
  }, progressDelay);
}

exports.stopProgressMsg = function stopProgressMsg(progressMsg) {
  clearInterval(progressMsg);
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
}


