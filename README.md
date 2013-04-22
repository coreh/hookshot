# hookshot

![](http://i.cloudup.com/i_vGKjtQcY2.png)

"You found the *hookshot*! It's a spring-loaded chain that you can cast out to hook things."

## Intro

**hookshot** is a tiny library and companion CLI tool for handling [GitHub post-receive hooks](https://help.github.com/articles/post-receive-hooks).

## Examples

### Library

```javascript
var hookshot = require('hookshot');
hookshot('refs/heads/master', 'git pull && make').listen(3000)
```

### CLI Tool

```bash
hookshot -r refs/heads/master 'git pull && make'
```

## Usage

The library exposes a single function, `hookshot()`. When called, this functions returns an express instance configured to handle post-receive hooks from GitHub. You can react to pushes to specific branches by listening to specific events on the returned instance, or by providing optional arguments to the `hookshot()` function.

```javascript
hookshot()
.on('refs/heads/master', 'git pull && make')
.listen(3000)
```

```javascript
hookshot('refs/heads/master', 'git pull && make').listen(3000)
```

### Actions

Actions can either be shell commands or JavaScript functions.

```javascript
hookshot('refs/heads/master', 'git pull && make').listen(3000)
```

```javascript
hookshot('refs/heads/master', function(info) {
  // do something with push info ...
}).listen(3000)
```

### Mounting to existing express servers

**hookshot** can be mounted to a custom route on your existing express server:

```javascript
// ...
app.use('/my-github-hook', hookshot('refs/heads/master', 'git pull && make'));
// ...
```

### Special Events

Special events are fired when branches/tags are created, deleted:

```javascript
hookshot()
.on('create', function(info) {
  console.log('ref ' + info.ref + ' was created.')
})
.on('delete', function(info) {
  console.log('ref ' + info.ref + ' was deleted.')
})
```

The `push` event is fired when a push is made to any ref:

```javascript
hookshot()
.on('push', function(info) {
  console.log('ref ' + info.ref + ' was pushed.')
})
```

Finally, the `hook` event is fired for every post-receive hook that is send by GitHub.

```javascript
hookshot()
.on('push', function(info) {
  console.log('ref ' + info.ref + ' was pushed.')
})
```

### CLI Tool

A companion CLI tool is provided for convenience. To use it, install **hookshot** via npm using the `-g` flag:

```bash
npm install -g hookshot
```

The CLI tool takes as argument a command to execute upon GitHub post-receive hook:

```bash
hookshot 'echo "PUSHED!"'
```

You can optionally specify an HTTP port via the `-p` flag (defaults to 3000) and a ref via the `-r` flag (defaults to all refs):

```bash
hookshot -r refs/heads/master -p 9001 'echo "pushed to master!"'
```
