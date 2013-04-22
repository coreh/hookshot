var child_process = require('child_process');
var express = require('express');

module.exports = function (ref, action) {
  
  // create express instance
  var hookshot = express();
  
  // middleware
  hookshot.use(express.bodyParser());
  
  // main POST handler
  hookshot.post('/', function (req, res, next) {    
    var payload = JSON.parse(req.body.payload);
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
    res.send(202, 'Accepted');
  });
  
  if (arguments.length == 1) {
    action = ref;
    ref = 'hook';
  }

  if (typeof action == 'string') {
    hookshot.on(ref, function(payload) {
      // shell command
      child_process.spawn(process.env.SHELL, ['-c', action], { stdio: 'inherit' });
    });
  } else if (typeof action == 'function') {
    hookshot.on(ref, action);
  }

  return hookshot;
}

