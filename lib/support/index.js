(function() {
  var $, Driver, argv, color, _,
    __slice = [].slice;

  Driver = require('selenium-webdriver');

  $ = Driver.promise;

  argv = require('minimist')(process.argv);

  _ = require('lodash');

  color = require('colors');

  global.timeout = 5000;

  module.exports = function() {
    var flowStep, shouldPreventBrowserReload, terminateDriver, _After, _Before;
    this.Driver = Driver;
    _Before = this.Before;
    _After = this.After;
    this._inFlow = function(code, callback) {
      return $.createFlow((function(_this) {
        return function(flow) {
          return flow.execute(function() {
            return code.call(_this);
          });
        };
      })(this)).then(_.partial(callback, null), function(err) {
        throw err;
      });
    };
    this.Before = function(code) {
      return _Before((function(_this) {
        return function(callback) {
          return _this._inFlow(code, callback);
        };
      })(this));
    };
    this.After = function(code) {
      return _After((function(_this) {
        return function(callback) {
          return _this._inFlow(code, callback);
        };
      })(this));
    };
    this.BeforeAll = function(code) {
      if (!this._ranBeforeAll) {
        this._ranBeforeAll = true;
        return this.Before(code);
      }
    };
    this.AfterAll = function(code) {
      if (!this._ranAfterAll) {
        this._ranAfterAll = true;
        return this.After(code);
      }
    };
    flowStep = (function(_this) {
      return function(code, args, pending, successCallback, errCallback) {
        _this.Pending = function(reason) {
          return successCallback = _.partial(pending, reason);
        };
        return $.createFlow(function(flow) {
          return flow.execute(function() {
            return code.apply(_this, args);
          });
        }).then(function(result) {
          return successCallback(null, result);
        }, errCallback);
      };
    })(this);
    this.Given = this.When = (function(_this) {
      return function(pattern, code) {
        return _this.defineStep(pattern, function() {
          var args, callback, _i;
          args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), callback = arguments[_i++];
          _this.lastStepType = 'Given';
          return flowStep(code, args, callback.pending, callback, callback);
        });
      };
    })(this);
    this.Then = (function(_this) {
      return function(pattern, code) {
        return _this.defineStep(pattern, function() {
          var args, callback, callforth, start, _i;
          args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), callback = arguments[_i++];
          _this.lastStepType = 'Then';
          start = new Date;
          callforth = function() {
            return flowStep(code, args, callback.pending, callback, function(error) {
              if (new Date - start > timeout) {
                return callback(error);
              } else {
                return $.delayed(1000).then(function() {
                  return callforth();
                });
              }
            });
          };
          return callforth();
        });
      };
    })(this);
    this.And = (function(_this) {
      return function(pattern, code) {
        return _this[_this.lastStepType](pattern, code);
      };
    })(this);
    this.Freeze = function() {
      var keyPress, stdin;
      keyPress = false;
      stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      console.log('Press any key to continue...'.yellow.inverse);
      process.stdin.on('data', (function(key) {
        return keyPress = true;
      }));
      return this.driver.wait((function() {
        return keyPress;
      }), Infinity).then(function() {
        return process.stdin.pause();
      });
    };
    this.Before(function() {
      this.lastStepType = 'Given';
      if (!this.driver || !shouldPreventBrowserReload()) {
        this.driver = new Driver.Builder().withCapabilities(Driver.Capabilities[argv.driver || 'chrome']()).build();
        return this.driver.visit = this.driver.get;
      }
    });
    this.After(function() {
      if (!shouldPreventBrowserReload()) {
        return terminateDriver();
      }
    });
    this.registerHandler("AfterFeatures", (function(_this) {
      return function(event, callback) {
        if (shouldPreventBrowserReload()) {
          return terminateDriver().then(function() {
            return callback();
          });
        } else {
          return callback();
        }
      };
    })(this));
    shouldPreventBrowserReload = function() {
      return argv['prevent-browser-reload'] != null;
    };
    terminateDriver = (function(_this) {
      return function() {
        _this.driver.close();
        return _this.driver.quit();
      };
    })(this);
    return this.When(/^I Freeze$/, this.Freeze);
  };

}).call(this);
