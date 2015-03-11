(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = function() {
    var $, Driver, Promise, World, _;
    World = this;
    this.Widgets = {};
    _ = require('lodash');
    Driver = require('selenium-webdriver');
    $ = Driver.promise;
    this.W = this.Widget = (function() {
      var m, staticMethod, staticMethods, _i, _len;

      Widget.extend = function(protoProps, staticProps) {
        var Surrogate, child, parent;
        parent = this;
        if (Object.hasOwnProperty(protoProps, 'constructor')) {
          child = protoProps.constructor;
        } else {
          child = function() {
            return parent.apply(this, arguments);
          };
        }
        child.copyProperties(this);
        child.copyProperties(staticProps);
        Surrogate = function() {
          this.constructor = child;
          return void 0;
        };
        Surrogate.prototype = this.prototype;
        child.prototype = new Surrogate();
        if (protoProps) {
          child.prototype.copyProperties(protoProps);
        }
        child.__super__ = this.prototype;
        return child;
      };

      Widget.find = function(attributes) {
        var _this;
        _this = _.extend(new this, attributes);
        return _this.find().then(function(el) {
          _this.el = el;
          return _this;
        });
      };

      staticMethods = ["click", "fill", "hover", "doubleClick", "read", "isPresent", "isVisible", "getAttribute", "getValue", "getText", "getInnerHTML", "getOuterHTML", "hasClass", "sendKeys", "clear"];

      for (_i = 0, _len = staticMethods.length; _i < _len; _i++) {
        staticMethod = staticMethods[_i];
        m = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return Widget.find({
            root: "html"
          }).then(function(w) {
            return w[args[0]].apply(w, args.slice(1));
          });
        };
        Widget[staticMethod] = _.partial(m, staticMethod);
      }

      function Widget(attributes) {
        if (attributes == null) {
          attributes = {};
        }
        _.extend(this, attributes);
        this.initialize.apply(this, arguments);
      }

      Widget.prototype.initialize = function() {};

      Widget.prototype.world = World;

      Widget.getter('driver', function() {
        return this._driver || World.driver;
      });

      Widget.prototype.click = function(opts) {
        return this.find(opts).then(function(el) {
          return el.click();
        });
      };

      Widget.prototype.fill = function(opts) {
        if (!(_.isObject(opts)) && !opts) {
          throw new Error("You must pass a value to fill with. https://github.com/mojotech/pioneer/blob/master/docs/widget.md#fill");
        }
        opts = _.isObject(opts) ? opts : {
          value: opts
        };
        return this.find(opts.selector).then(function(el) {
          return el.clear().then(function() {
            return el.sendKeys.apply(el, Array.prototype.slice.call(opts.value));
          });
        });
      };

      Widget.prototype.read = function(opts) {
        if (_.isString(opts) || opts === void 0) {
          return this.find(opts).then(function(el) {
            return el.getText();
          });
        } else {
          _.defaults(opts, {
            transformer: function(value) {
              return value;
            },
            selector: null
          });
          return this.find(opts.selector).then(function(el) {
            return el.getText().then(opts.transformer);
          });
        }
      };

      Widget.prototype.getValue = function(opts) {
        if (opts == null) {
          opts = {};
        }
        if (_.isString(opts)) {
          opts = {
            selector: opts
          };
        }
        _.defaults(opts, {
          transformer: function(val) {
            return val;
          }
        });
        return this.find(opts).then(function(el) {
          return el.getAttribute('value').then(opts.transformer);
        });
      };

      Widget.prototype.find = function(opts) {
        var deferred;
        deferred = new $.Deferred;
        if (!opts || _.isString(opts)) {
          opts = {
            selector: opts
          };
        }
        if (opts.text) {
          return this._findByText(opts);
        }
        if (this.el) {
          if (!opts.selector) {
            deferred.fulfill(this.el);
          } else {
            return this.el.findElement(Driver.By.css(opts.selector));
          }
          return deferred;
        }
        return this._ensureElement(opts.selector).then((function(_this) {
          return function() {
            return _this.driver.findElement(Driver.By.css(_this._selector(opts.selector)));
          };
        })(this));
      };

      Widget.prototype.getHtml = function(opts) {
        return this.find(opts).then(function(el) {
          return el.getOuterHtml();
        });
      };

      Widget.prototype.getText = function(opts) {
        return this.find(opts).then(function(el) {
          return el.getText();
        });
      };

      Widget.prototype.getAttribute = function(opts) {
        if (_.isString(opts)) {
          opts = {
            attribute: opts
          };
        }
        return this.find(opts).then(function(el) {
          return el.getAttribute(opts.attribute);
        });
      };

      Widget.prototype.getInnerHTML = function(opts) {
        return this.find(opts).then(function(el) {
          return el.getInnerHtml();
        });
      };

      Widget.prototype.getOuterHTML = function(opts) {
        return this.find(opts).then(function(el) {
          return el.getOuterHtml();
        });
      };

      Widget.prototype.isPresent = function(selector) {
        if (this._selector(selector) !== "undefined") {
          return this.driver.isElementPresent(Driver.By.css(this._selector(selector)));
        } else {
          return this.el.isDisplayed();
        }
      };

      Widget.prototype.isVisible = function(opts) {
        if (opts == null) {
          opts = {};
        }
        if (_.isString(opts)) {
          opts = {
            selector: opts
          };
        }
        return this.isPresent(opts.selector).then((function(_this) {
          return function(present) {
            if (present) {
              return _this.find(opts).then(function(elm) {
                return elm.isDisplayed();
              });
            } else {
              return false;
            }
          };
        })(this));
      };

      Widget.prototype.addClass = function(opts) {
        if (_.isString(opts)) {
          opts = {
            className: opts
          };
        }
        return this.find(opts.selector).then((function(_this) {
          return function(el) {
            return _this.driver.executeScript("arguments[0].classList.add(arguments[1])", el, opts.className);
          };
        })(this));
      };

      Widget.prototype.removeClass = function(opts) {
        if (_.isString(opts)) {
          opts = {
            className: opts
          };
        }
        return this.find(opts.selector).then((function(_this) {
          return function(el) {
            return _this.driver.executeScript("arguments[0].classList.remove(arguments[1])", el, opts.className);
          };
        })(this));
      };

      Widget.prototype.toggleClass = function(opts) {
        if (_.isString(opts)) {
          opts = {
            className: opts
          };
        }
        return this.find(opts.selector).then((function(_this) {
          return function(el) {
            return _this.driver.executeScript("arguments[0].classList.toggle(arguments[1])", el, opts.className);
          };
        })(this));
      };

      Widget.prototype.hasClass = function(opts) {
        if (_.isString(opts)) {
          opts = {
            className: opts
          };
        }
        return this.find(opts.selector).then((function(_this) {
          return function(el) {
            return _this.driver.executeScript("return arguments[0].classList.contains(arguments[1])", el, opts.className);
          };
        })(this));
      };

      Widget.prototype.findAll = function(selector) {
        return this.find().then((function(_this) {
          return function(el) {
            return new World.Widget.List({
              el: el,
              itemSelector: selector
            });
          };
        })(this));
      };

      Widget.prototype._selector = function(selector) {
        return this.root + (selector ? " " + selector : '');
      };

      Widget.prototype._findByText = function(opts) {
        var _selector;
        _selector = Driver.By.xpath('.//*[normalize-space(text())=normalize-space("' + opts.text + '")]');
        return this.find().then((function(_this) {
          return function(el) {
            return _this.driver.wait(_.bind(el.findElement, el, _selector), global.timeout, "Unable to find node containing text " + opts.text).then(function() {
              return el.findElement(_selector);
            });
          };
        })(this));
      };

      Widget.prototype._ensureElement = function(selector) {
        return this.driver.wait(_.bind(this.isPresent, this, selector), global.timeout, "" + (this._selector(selector)) + " not found");
      };

      Widget.prototype.sendKeys = function() {
        var opts;
        opts = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (opts.length > 1) {
          return this.sendKeys({
            keys: opts
          });
        } else {
          opts = opts[0];
          if (!(_.isObject(opts))) {
            opts = {
              keys: Array.prototype.concat(opts)
            };
          }
          return this.find(opts.selector).then(function(el) {
            return el.sendKeys.apply(el, Array.prototype.concat(opts.keys));
          });
        }
      };

      Widget.prototype.hover = function(opts) {
        return this.find(opts).then((function(_this) {
          return function(el) {
            return new Driver.ActionSequence(_this.driver).mouseMove(el).perform().then(function() {
              return _this;
            });
          };
        })(this));
      };

      Widget.prototype.doubleClick = function(opts) {
        return this.find(opts).then((function(_this) {
          return function(el) {
            return new Driver.ActionSequence(_this.driver).doubleClick(el).perform().then(function() {
              return _this;
            });
          };
        })(this));
      };

      Widget.prototype.clear = function(opts) {
        return this.find(opts).then((function(_this) {
          return function(el) {
            return el.clear().then(function() {
              return _this;
            });
          };
        })(this));
      };

      Widget.prototype._map = function(collection, callback) {
        var results, _reduce;
        results = [];
        _reduce = function(p, f, i) {
          return p.then(function() {
            return callback(f, i).then(function(v) {
              return results.push(v);
            });
          });
        };
        return _.reduce(collection, _reduce, Driver.promise.fulfilled()).then(function() {
          return results;
        });
      };

      return Widget;

    })();
    _ = require("lodash");
    Driver = require('selenium-webdriver');
    $ = Driver.promise;
    this.Widget.List = (function(_super) {
      __extends(List, _super);

      function List() {
        return List.__super__.constructor.apply(this, arguments);
      }

      List.prototype.itemSelector = 'li';

      List.prototype.itemClass = World.Widget;

      List.prototype.getItemClass = function(el) {
        return $.fulfilled(this.itemClass);
      };

      List.prototype.at = function(opts) {
        if (_.isNumber(opts)) {
          return this.items().then(function(items) {
            return items[opts];
          });
        } else {
          throw new Error("Argument must be a number. https://github.com/mojotech/pioneer/blob/master/docs/list.md#at");
        }
      };

      List.prototype.clickAt = function(opts) {
        if (_.isNumber(opts)) {
          opts = {
            index: opts
          };
        }
        return this.at(opts.index).then(function(widget) {
          return widget.click(opts.selector);
        });
      };

      List.prototype.readAt = function(opts) {
        if (_.isNumber(opts)) {
          return this.at(opts).then(function(widget) {
            return widget.read();
          });
        } else {
          return this.at(opts.index).then(function(widget) {
            return widget.read(opts);
          });
        }
      };

      List.prototype.map = function(iter) {
        return this.items().then(function(items) {
          return $.map(items, iter);
        });
      };

      List.prototype.each = function(iter) {
        return this.map.apply(this, arguments).then(function() {
          return this.items;
        });
      };

      List.prototype.length = function() {
        return this.items().then(function(items) {
          return items.length;
        });
      };

      List.prototype.invoke = function(opts) {
        if (_.isString(opts) || _.isFunction(opts)) {
          opts = {
            method: opts
          };
        }
        return this.map(function(item) {
          if (_.isFunction(opts.method)) {
            return opts.method.apply(item, opts["arguments"]);
          } else {
            return item[opts.method].apply(item, opts["arguments"]);
          }
        });
      };

      List.prototype.filter = function(iter) {
        return this.items().then(function(items) {
          return $.filter(items, iter);
        });
      };

      List.prototype.items = function() {
        return this.find().then((function(_this) {
          return function(el) {
            return el.findElements(Driver.By.css(_this.itemSelector));
          };
        })(this)).then((function(_this) {
          return function(elms) {
            return _this._map(elms, function(el) {
              return _this.getItemClass(el).then(function(itemClass) {
                return new itemClass({
                  el: el
                });
              });
            });
          };
        })(this));
      };

      List.prototype.findWhere = function(iter) {
        return this.filter(iter).then(function(items) {
          if (items) {
            return items[0];
          }
        });
      };

      return List;

    })(this.Widget);
    Promise = require('bluebird');
    _ = require('lodash');
    return this.Widget.Form = (function(_super) {
      __extends(Form, _super);

      function Form() {
        this.submitWith = __bind(this.submitWith, this);
        this.submitForm = __bind(this.submitForm, this);
        return Form.__super__.constructor.apply(this, arguments);
      }

      Form.prototype.root = 'form';

      Form.prototype.submitSelector = function() {
        return this.find('[type="submit"]');
      };

      Form.prototype.submitForm = function() {
        return this.submitSelector().then(function(el) {
          return el.click();
        });
      };

      Form.prototype.submitWith = function(values) {
        return this.fillAll(values).then(this.submitForm);
      };

      Form.prototype.select = function(opts) {
        if (!(_.isObject(opts)) && !opts) {
          throw new Error('You must provide something to select by.');
        }
        opts = _.isObject(opts) ? opts : {
          text: opts
        };
        if ((opts.text != null) && (opts.value != null)) {
          throw new Error('You may only have one select by attribute.');
        } else if (opts.text != null) {
          return this._selectByText(opts.text);
        } else if (opts.value != null) {
          return this._selectByValue(opts.value);
        }
      };

      Form.prototype._selectByText = function(text) {
        return this.find({
          text: text
        }).then(function(el) {
          return el.click();
        });
      };

      Form.prototype._selectByValue = function(value) {
        return this.find("option[value=\"" + value + "\"]").then(function(el) {
          return el.click();
        });
      };

      Form.prototype.fillAll = function(values) {
        return this._map(Object.keys(values), (function(_this) {
          return function(f) {
            return _this.fill({
              selector: _this._name(f),
              value: values[f]
            });
          };
        })(this));
      };

      Form.prototype.readAll = function() {
        var _readAll;
        _readAll = (function(_this) {
          return function(f) {
            return _this.getValue(_this._name(f)).then(function(v) {
              return [f, v];
            });
          };
        })(this);
        return this._map(this.fields, _readAll).then(function(read) {
          return _.object(read);
        });
      };

      Form.prototype._name = function(name) {
        return "[name='" + name + "']";
      };

      return Form;

    })(this.Widget);
  };

}).call(this);
