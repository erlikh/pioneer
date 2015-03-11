(function() {
  var $, Driver;

  Driver = require('selenium-webdriver');

  $ = Driver.promise;

  module.exports = function() {
    var chai, origDescriptor;
    origDescriptor = function(source, prop) {
      if (!source) {
        return nil;
      }
      return Object.getOwnPropertyDescriptor(source, prop) || origDescriptor(Object.getPrototypeOf(source), prop);
    };
    Object.defineProperties(Object.prototype, {
      copyProperties: {
        value: function(source) {
          var prop;
          for (prop in source) {
            Object.defineProperty(this, prop, origDescriptor(source, prop));
          }
          return this;
        }
      },
      includes: {
        value: function(mixin) {
          this.copyProperties(this, mixin);
          this.copyProperties(this.prototype, mixin.prototype);
          return this;
        }
      },
      getter: {
        value: function(object, property, getter) {
          var _ref;
          if (!getter) {
            _ref = [this.prototype, object, property], object = _ref[0], property = _ref[1], getter = _ref[2];
          }
          return Object.defineProperty(object, property, {
            configurable: true,
            enumerable: true,
            get: getter
          });
        }
      },
      setter: {
        value: function(object, property, setter) {
          var getter, _ref;
          if (!setter) {
            _ref = [this.prototype, object, property], object = _ref[0], property = _ref[1], getter = _ref[2];
          }
          return Object.defineProperty(object, property, {
            configurable: true,
            enumerable: true,
            set: getter
          });
        }
      },
      accessor: {
        value: function(object, property) {
          var _ref;
          if (!property) {
            _ref = [this.prototype, object], object = _ref[0], property = _ref[1];
          }
          return Object.defineProperty(object, property, {
            configurable: true,
            enumerable: true,
            get: function() {
              return this["_" + property];
            },
            set: function(v) {
              return this["_" + property] = v;
            }
          });
        }
      }
    });
    chai = require('chai');
    chai.use(require('chai-as-promised'));
    chai.should();
    Object.defineProperty($.Promise.prototype, 'should', {
      get: Object.prototype.__lookupGetter__('should')
    });
    if (process.env.CHROMEDRIVER_PORT) {
      return require('../node_modules/selenium-webdriver/chrome').ServiceBuilder.prototype.port_ = process.env.CHROMEDRIVER_PORT;
    }
  };

}).call(this);
