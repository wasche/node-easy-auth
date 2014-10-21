var stream = require('stream'),
    util = require('util');

var MockStream = module.exports = function(){
  var self = this;
  this.on('pipe', function(src){
    var _emit = src.emit;
    src.emit = function(){
      _emit.apply(src, arguments);
    };

    src.on('data', function(d){
      self.emit('data', d + '');
    });
  });
};

util.inherits(MockStream, stream.Stream);

['resume', 'pause', 'setEncoding', 'flush', 'end'].forEach(function (method){
  MockStream.prototype[method] = function () { /* Mock */ };
});

MockStream.prototype.write = function(msg){
  this.emit('data', msg);
  return true;
};

MockStream.prototype.writeNextTick = function(msg){
  var self = this;
  process.nextTick(function(){
    self.write(msg);
  });
};
