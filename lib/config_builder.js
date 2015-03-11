(function() {
  var CONFIG_NAMES, CUCUMBER_FORMATTERS, fs, path, scaffold, _;

  fs = require('fs');

  path = require('path');

  scaffold = require('./scaffold_builder.js');

  _ = require('lodash');

  CONFIG_NAMES = ["tags", "feature", "require", "format", "error_formatter", "coffee", "driver", "preventReload", "scaffold"];

  CUCUMBER_FORMATTERS = ["pretty", "progress", "json", "summary"];

  module.exports = {
    convertToExecOptions: function(objArry, libPath) {
      var execOptions;
      execOptions = _.map(objArry, (function(_this) {
        return function(val) {
          var k, p, v;
          k = _.keys(val)[0];
          switch (false) {
            case k !== 'tags':
              return ("--" + k + "=").concat((_(Array.prototype.concat(val[k])).flatten().value()).join(", "));
            case k !== 'driver':
              process.argv.push("--driver=" + val[k]);
              return "";
            case k !== 'coffee':
              if (val[k]) {
                return "--" + k;
              } else {
                return "";
              }
              break;
            case k !== "format":
              v = val[k];
              if (_this.isCucumberFormatter(v)) {
                return "--format=" + v;
              } else if (fs.existsSync(p = path.join(process.cwd(), v))) {
                return "--format=" + p;
              } else {
                return "--format=" + (path.join(libPath, v));
              }
              break;
            case k !== 'preventReload':
              v = val[k];
              switch (false) {
                case typeof v !== "string":
                  if (v === "true") {
                    process.argv.push("--prevent-browser-reload");
                  }
                  return "";
                default:
                  if (val[k]) {
                    process.argv.push("--prevent-browser-reload");
                  }
                  return "";
              }
              break;
            case k !== 'feature':
              return "" + val[k];
            case k !== 'require':
              return val[k].reduce(function(p, v) {
                return p.concat("--require", v);
              }, []);
            default:
              if (k != null) {
                return "--" + k + "=" + val[k];
              } else {
                return "";
              }
          }
        };
      })(this));
      return _(["--require", path.join(libPath, "support")]).concat(execOptions).flatten().compact().tap(function(arr) {
        return arr.splice(0, 0, null, null);
      }).value();
    },
    generateOptions: function(minimist, config, libPath) {
      var options;
      options = _(CONFIG_NAMES).map(function(name) {
        var obj;
        obj = {};
        if ((minimist[name] != null)) {
          obj[name] = minimist[name];
          if (name === 'require' && (config[name] != null)) {
            obj[name] = Array.prototype.concat(obj[name]).concat(config[name]);
          }
        } else if (config[name] != null) {
          obj[name] = config[name];
        }
        if (obj[name] != null) {
          return obj;
        } else {
          return null;
        }
      }).compact().value();
      if (!this.hasFeature(options)) {
        if (fs.existsSync(path.join(process.cwd(), '/features'))) {
          return this.convertToExecOptions(options, libPath);
        } else {
          if (!!minimist["_"].length) {
            options.push({
              feature: minimist["_"]
            });
            return this.convertToExecOptions(options, libPath);
          } else {
            scaffold.featureNotSpecified();
            return null;
          }
        }
      } else {
        return this.convertToExecOptions(options, libPath);
      }
    },
    hasFeature: function(options) {
      var r;
      r = false;
      _.forEach(options, (function(_this) {
        return function(opt) {
          var k;
          k = _.keys(opt)[0];
          if (k === 'feature') {
            return r = true;
          }
        };
      })(this));
      return r;
    },
    isCucumberFormatter: function(formatter) {
      return !!(_.find(CUCUMBER_FORMATTERS, function(f) {
        return f === formatter;
      }));
    }
  };

}).call(this);
