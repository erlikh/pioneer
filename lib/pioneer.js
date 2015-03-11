(function() {
  var Pioneer, color, configBuilder, cucumber, fs, moment, path, scaffoldBuilder;

  moment = require('moment');

  fs = require('fs');

  path = require('path');

  configBuilder = require('./config_builder');

  scaffoldBuilder = require('./scaffold_builder');

  color = require('colors');

  cucumber = require('cucumber');

  Pioneer = (function() {
    function Pioneer(libPath, args) {
      var configPath, p;
      if (this.isVersionRequested(args)) {
        console.log(require('../package').version);
        return;
      }
      if (args.configPath && fs.existsSync(args.configPath)) {
        configPath = args.configPath;
      } else if (args.scaffold) {
        scaffoldBuilder.createScaffold();
      } else {
        p = path.join(process.cwd(), '/pioneer.json');
        if (fs.existsSync(p)) {
          configPath = p;
        } else {
          configPath = null;
        }
      }
      this.getSpecifications(configPath, libPath, args);
    }

    Pioneer.prototype.getSpecifications = function(path, libPath, args) {
      var configObject;
      configObject = {};
      if (path) {
        return fs.readFile(path, 'utf8', (function(_this) {
          return function(err, data) {
            if (err) {
              throw err;
            }
            configObject = _this.parseAndValidateJSON(data, path);
            if (_this.isVerbose(args, configObject)) {
              console.log(('Configuration loaded from ' + path).yellow.inverse);
            }
            return _this.applySpecifications(configObject, libPath, args);
          };
        })(this));
      } else {
        if (this.isVerbose(args, configObject)) {
          console.log('No configuration path specified'.yellow.inverse);
        }
        return this.applySpecifications(configObject, libPath, args);
      }
    };

    Pioneer.prototype.applySpecifications = function(obj, libPath, args) {
      var opts;
      opts = configBuilder.generateOptions(args, obj, libPath);
      if (opts) {
        return this.start(opts);
      }
    };

    Pioneer.prototype.start = function(opts) {
      require('./environment')();
      return cucumber.Cli(opts).run(function(success) {
        return process.exit(success ? 0 : 1);
      });
    };

    Pioneer.prototype.parseAndValidateJSON = function(config, path) {
      var err;
      try {
        return JSON.parse(config);
      } catch (_error) {
        err = _error;
        throw new Error(path + " does not include a valid JSON object.\n");
      }
    };

    Pioneer.prototype.isVersionRequested = function(args) {
      return args.version || args.v;
    };

    Pioneer.prototype.isVerbose = function(args, config) {
      if (config == null) {
        config = {};
      }
      if (args.verbose != null) {
        return args.verbose && args.verbose !== "false";
      } else {
        return !!config.verbose;
      }
    };

    return Pioneer;

  })();

  module.exports = Pioneer;

}).call(this);
