var assert    = require('assert'),
    supertest = require('supertest'),
    hookshot  = require('../lib');

process.env.NODE_ENV = 'test';

describe('hookshot server', function() {

  var server, request;

  beforeEach(function() {
     server = hookshot('test', 'exit 1'),
     request = supertest(server);
  });

  it('should throw an error on invalid payload', function(done) {
    request
      .post('/')
      .set('Accept', 'application/json')
      .send({})
      .end(function(err) {
        assert(err);
        done();
      });
  });

  it('should emit an error on invalid payload', function(done) {

    var errorEmitCheck = function(err) {
      assert(err);
      done();
      server.removeListener('error', errorEmitCheck);
    };

    server.on('error', errorEmitCheck);

    request
      .post('/')
      .set('Accept', 'application/json')
      .send({})
      .expect(500)
      .end(function(err) {
        assert(err);
      });
  });

  it('should get a create event', function(done) {
    server.on('create', function(payload) {
      assert(payload);
      done();
    });

    request
      .post('/')
      .set('Accept', 'application/json')
      .send({ ref: 'test', created: true })
      .expect(202)
      .end(function(err, res) {
        assert(!err);
      });
  });

  it('should get a delete event', function(done) {
    server.on('delete', function(payload) {
      assert(payload);
      done();
    });

    request
      .post('/')
      .set('Accept', 'application/json')
      .send({ ref: 'test', deleted: true })
      .expect(202)
      .end(function(err, res) {
        assert(!err);
      });
  });

  it('should get a push event if created and deleted are falsy', function(done) {
    server.on('push', function(payload) {
      assert(payload);
      done();
    });

    request
      .post('/')
      .set('Accept', 'application/json')
      .send({ ref: 'test' })
      .expect(202)
      .end(function(err, res) {
        assert(!err);
      });
  });

  it('should get reference event with payload on hook', function(done) {
    server.on('test', function(payload) {
      done();
    });

    request
      .post('/')
      .set('Accept', 'application/json')
      .send({ ref: 'test' })
      .expect(202)
      .end(function(err, res) {
        assert(!err);
      });

  });

  it('should run command `exit 1` when running receiving a hook for reference "test"', function(done) {

    server.on('spawn', function(instance) {
      instance.on('close', function(code) {
        assert.equal(code, 1);
        done();
      });
    });

    request
      .post('/')
      .set('Accept', 'application/json')
      .send({ ref: 'test' })
      .expect(202)
      .end(function(err, res) {
        assert(!err);
      });
  });
});

