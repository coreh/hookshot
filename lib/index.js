var bodyParser = require('body-parser');
var normalize = require('path').normalize;
var spawn = require('child_process').spawn;
var express = require('express');

module.exports = function (ref, action) {

  // create express instance
  var hookshot = express();

  // middleware
  hookshot.use(bodyParser.urlencoded({ extended: false }));
  hookshot.use(bodyParser.json());

  // main POST handler
  hookshot.post('/', function (req, res, next) {
    var payload = req.body;
    if (typeof payload.payload != 'undefined') {
      payload = JSON.parse(payload.payload);
    }
    if (typeof payload.ref != 'string') {
      throw new Error('Invalid ref');
    }
    if (payload.created) {
      hookshot.emit('create', payload);
    } else if (payload.deleted) {
      hookshot.emit('delete', payload);
    } else {
      hookshot.emit('push', payload);
    }
    hookshot.emit('hook', payload);
    hookshot.emit(payload.ref, payload);
    res.send(202, 'Accepted\n');
  });

  if (arguments.length == 1) {
    action = ref;
    ref = 'hook';
  }

  if (typeof action == 'string') {
    var shell = process.env.SHELL;
    var args = ['-c', action];
    var opts = { stdio: 'inherit' };
    if (shell && isCygwin()) {
      shell = cygpath(shell);
    } else if (isWin()) {
      shell = process.env.ComSpec;
      args = ['/s', '/c', '"' + action + '"'];
      opts.windowsVerbatimArguments = true;
    }

    hookshot.on(ref, function(payload) {
      // shell command
      spawn(shell, args, opts);
    });
  } else if (typeof action == 'function') {
    hookshot.on(ref, action);
  }

  return hookshot;
};

/**
 * Returns `true` if node is currently running on Windows, `false` otherwise.
 *
 * @return {Boolean}
 * @api private
 */

function isWin () {
  return 'win32' == process.platform;
}

/**
 * Returns `true` if node is currently running from within a "cygwin" environment.
 * Returns `false` otherwise.
 *
 * @return {Boolean}
 * @api private
 */

function isCygwin () {
  // TODO: implement a more reliable check here...
  return isWin() && /cygwin/i.test(process.env.HOME);
}

/**
 * Convert a Unix-style Cygwin path (i.e. "/bin/bash") to a Windows-style path
 * (i.e. "C:\cygwin\bin\bash").
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

function cygpath (path) {
  path = normalize(path);
  if (path[0] == '\\') {
    // TODO: implement better cygwin root detection...
    path = 'C:\\cygwin' + path;
  }
  return path;
}
