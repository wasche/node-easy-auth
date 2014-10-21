/* globals describe, it, beforeEach */
var assert = require('assert');
var MockStream = require('./MockStream');
var EasyAuth = require('../EasyAuth');

describe('EasyAuth', function(){

  var stdin, stdout, auth;

  beforeEach(function(){
    stdin = new MockStream();
    stdout = new MockStream();
  });

  describe('#require()', function(){

    it('should prompt for both by default', function(done){
      auth = new EasyAuth({input: stdin, output: stdout});

      stdin.writeNextTick('the user\n');
      stdin.writeNextTick('the password\n');

      auth.require(function(err, user, pass){
        assert.equal(user, 'the user');
        assert.equal(pass, 'the password');

        done();
      });
    });

    it('should emit success', function(done){
      auth = new EasyAuth({input: stdin, output: stdout});

      stdin.writeNextTick('U\n');
      stdin.writeNextTick('P\n');

      auth.require();
      auth.on('success', function(user, pass){
        assert.equal(user, 'U');
        assert.equal(pass, 'P');

        done();
      });
    });

  });
});