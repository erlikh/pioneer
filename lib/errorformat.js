(function() {
  var color, colorFirstLine, format, shorten;

  color = require('colors');

  module.exports = function(failure) {
    return format(failure);
  };

  format = function(failure) {
    var message;
    message = shorten(failure, 5);
    return colorFirstLine(message);
  };

  shorten = function(message, numlines) {
    return message.split('\n').splice(0, numlines).join('\n');
  };

  colorFirstLine = function(message) {
    var split;
    split = message.split('\n');
    split[0] = split[0].red.inverse;
    return split.join('\n');
  };

}).call(this);
