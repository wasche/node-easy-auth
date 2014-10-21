'use strict';

// Extend a given object with all the properties in passed-in object(s).
function extend(obj) {
  if (!obj || typeof obj !== 'object'){ return obj; }
  var source, prop;
  for (var i = 1, length = arguments.length; i < length; i++) {
    source = arguments[i];
    for (prop in source) {
      obj[prop] = source[prop];
    }
  }
  return obj;
}

var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , async = require('async')
  , read = require('read')
  ;

var STORE = {
  NONE  : null
, ENV   : 'env'
, FILE  : 'file'
};

var STORE_FORMAT = {
  COLON   : '%u:%p'
, NEWLINE : '%u\n%p'
};

var ENCRYPT = {
  PLAIN   : null
, MD5     : 'md5'
, BASE64  : 'base64'
};

var DEFAULT_OPTIONS = {
  userPrompt  : 'Username: '
, passPrompt  : 'Password: '
, store       : null
, storeName   : null
, storeFormat : STORE_FORMAT.COLON
, encrypt     : ENCRYPT.MD5
, skipUser    : false
, input       : process.stdin
, output      : process.stdout
};

/**
 *
 * @param {Object} ops options
 * @param {String} [storeName]
 * @api public
 */
var EasyAuth = function(ops, storeName){
  this.options = extend({}, DEFAULT_OPTIONS, ops);
  if (this.options.store && !this.options.storeName){
    if (this.options.store === STORE.ENV){
      this.options.storeName = storeName;
    }
    else if (this.options.store === STORE.FILE){
      this.options.storeName = '~/tmp/' + storeName + '.auth';
    }
  }
  EventEmitter.call(this);
};

util.inherits(EasyAuth, EventEmitter);

EasyAuth.prototype.username = function user(fn){
  if (this.options.skipUser) {
    fn && fn(null, null);
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
      if (err) { self.emit('error', err); }
      else { self.user = user; }
      self.emit('username', user);
      fn && fn(err, user);
    }
  );
  return this;
};

EasyAuth.prototype.password = function pass(fn){
  var self = this;
  read({
      prompt: this.options.passPrompt
    , silent: true
    , input   : this.options.input
    , output  : this.options.output
    }, function(err, pass){
      if (err) { self.emit('error', err); }
      else { self.pass = pass; }
      self.emit('password', pass);
      fn(err, pass);
    }
  );
  return this;
};

EasyAuth.prototype.require = function(fn){
  var self = this;
  async.series([
    function(callback){
      self.username(callback);
    },
    function(callback){
      self.password(callback);
    }],
    function(err){
      err || self.emit('success', self.user, self.pass);
      fn && fn(err, self.user, self.pass);
    }
  );
  return this;
};

/* expose constants for easy use */
EasyAuth.VERSION = require('./package.json').version;
EasyAuth.STORE = STORE;
EasyAuth.STORE_FORMAT = STORE_FORMAT;
EasyAuth.ENCRYPT = ENCRYPT;

module.exports = function(options){
  return new EasyAuth(options);
};