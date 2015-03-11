(function() {
  var color, fs, path, prompt, _;

  fs = require('fs');

  path = require('path');

  prompt = require('prompt');

  color = require('colors');

  _ = require('lodash');

  module.exports = {
    featureNotSpecified: function() {
      prompt.start();
      return prompt.get({
        message: "You did not specify a feature path. Would you like Pioneer to generate one for you? y/n",
        required: true
      }, (function(_this) {
        return function(err, r) {
          if (['y', 'yes'].indexOf(r.question.toLowerCase()) > -1) {
            return _this.createScaffold();
          } else {
            console.log('Looks like you have no feature files or have not passed the path to them. http://www.github.com/mojotech/pioneer/docs');
            return process.exit();
          }
        };
      })(this));
    },
    createScaffold: function(options) {
      var features, fixtures, hiddenPioneer, p, steps, widgets;
      p = path.join(process.cwd(), '/tests');
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
      }
      features = path.join(p, '/features');
      if (!fs.existsSync(features)) {
        fs.mkdirSync(features);
      }
      fixtures = path.join(p, '/fixtures');
      if (!fs.existsSync(fixtures)) {
        fs.mkdirSync(fixtures);
      }
      widgets = path.join(p, '/widgets');
      if (!fs.existsSync(widgets)) {
        fs.mkdirSync(widgets);
      }
      steps = path.join(p, '/steps');
      if (!fs.existsSync(steps)) {
        fs.mkdirSync(steps);
      }
      fs.writeFileSync(path.join(features, 'simple.feature'), fs.readFileSync(path.join(__dirname, "scaffold/simple.txt"), 'utf8'));
      fs.writeFileSync(path.join(steps, 'simple.js'), fs.readFileSync(path.join(__dirname, "scaffold/simple.js"), 'utf8'));
      hiddenPioneer = path.join(process.cwd(), '/pioneer.json');
      if (!fs.existsSync(hiddenPioneer)) {
        fs.writeFileSync(hiddenPioneer, fs.readFileSync(path.join(__dirname, "scaffold/example.json"), 'utf8'));
      } else {
        this.askToOverWrite(hiddenPioneer, fs.readFileSync(path.join(__dirname, "scaffold/example.json"), 'utf8'));
      }
      this._logCompleted();
      return process.exit();
    },
    askToOverWrite: function(file, data) {
      prompt.start();
      return prompt.get({
        message: "It looks like you already have a " + file + " , are you sure that you would like to overwrite this? y/n",
        required: true
      }, (function(_this) {
        return function(err, r) {
          if (['y', 'yes'].indexOf(r.question.toLowerCase()) > -1) {
            return fs.writeFileSync(file, data);
          } else {
            return console.log("You chose not to overwrite " + file + " to run the scaffold files include tests/features in the feature option of your config files.");
          }
        };
      })(this));
    },
    _logCompleted: function() {
      return console.log('Scaffold created. You may now run your first test'.inverse.green);
    }
  };

}).call(this);
