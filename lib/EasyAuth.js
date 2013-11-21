modules.export = (function(){

  var pkg = require('package.json')
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , _ = require('underscore')
    , async = require('async')
    , read = require('read')
    , DEFAULT_OPTIONS = {
        userPrompt  : 'Username: '
      , passPrompt  : 'Password: '
      , store       : null
      , storeName   : null
      , storeFormat : mod.STORE_FORMAT.COLON
      , encrypt     : mod.ENCRYPT.MD5
      , skipUser    : false
      , input       : process.stdin
      , output      : process.stdout
      }
    ;

  function user(callback){
    if (this.options.skipUser) {
      callback();
      return;
    }
    var self = this;
    read({
        prompt  : this.options.userPrompt
      , default : process.env.USER || process.env.LOGNAME
      , input   : this.options.input
      , output  : this.options.output
      },
      function(err, user){
        if (err) self.emit('error', err);
        else self.user = user;
        callback();
      }
    );
  }

  function pass(callback){
    var self = this;
    read({
        prompt: this.options.passPrompt
      , silent: true
      , input   : this.options.input
      , output  : this.options.output
      }, function(err, pass){
        if (err) self.emit('error', err);
        else self.pass = pass;
        callback();
      }
    );
  }

  var EasyAuth = function(ops){
    this.options = _.extend({}, DEFAULT_OPTIONS, ops);
    if (store && !storeName){
      if (store === mod.STORE.ENV){
        this.options.storeName = process.argv[1];
      }
      else if (store === mod.STORE.FILE){
        this.options.storeName = '~/tmp/' + process.argv[1] + '.auth';
      }
    }
    EventEmitter.call(this);
  };
  util.inherits(EasyAuth, EventEmitter);

  EasyAuth.prototype.require = function(){
    var self = this;
    async.serial(
      function(callback){
        user.call(self, callback);
      },
      function(callback){
        pass.call(self, callback);
      },
      function(callback){
        self.emit('success', self.user, self.pass);
      }
    );
  };

  var mod = function(ops){
    return new EasyAuth(ops);
  };

  mod.VERSION = pkg.version;
  mod.STORE = {
    NONE  : null
  , ENV   : 'env'
  , FILE  : 'file'
  };
  mod.STORE_FORMAT = {
    COLON   : '%u:%p'
  , NEWLINE : '%u\n%p'
  };
  mod.ENCRYPT = {
    PLAIN   : null
  , MD5     : 'md5'
  , BASE64  : 'base64'
  };

  return mod;

}());