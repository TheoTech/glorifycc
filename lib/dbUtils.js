var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var mongoose = require('mongoose');
var mongoConfig = require('../lib/mongoConfig');
var Song = require('../models/song');

var now = new Date();

// bits of my old code using a mix of Node callbacks and promises before I understood promises better

var saveTranslationCallback = function(translations) {
  return function(original) {
    translations.forEach(translation) {
      translation.source = original.id;
    }
    return Song.create(translations); // returns promise
  }
}

var processFile = function(data) {
  translations = JSON.parse(data);

  if (!Array.isArray(translations)) {
    translations = [translations];
  }

  translations.forEach(function(translation) {
    translation.timeAdded = now;
  });

  return translations;
}

var save = function(translations) {



  baseSong.save().then(
    saveTranslationCallback(translations),
    function(err) {
      throw 'Unable to store base song. Reason:\n' + err;
    }
  ).then(
    function(song) {
      console.log('Saved all songs');
    }, function(err) {
      console.log('Unable to store translated song. Reason:');
      console.log(err); // either db failure or 'Unable to store sample song'
    }
  ).then(closeDb);
};

// new code using promises

var processFile = function(file) {}
  var translations = processFile(data);
  var baseSong = translations.shift();
  return baseSong.save()
    .catch(function(err) {
      return Promise.reject('Could not save base song' + err)
  }).then(function(original) {
      translations.forEach(translation) {
        translation.source = original.id;
      }
      return Song.create(translations); // returns promise
  });
};

var parseFiles = function(files) {
  return Promise.all(files.map(function() {
    return fs.readFileAsync(file, 'utf8')
      .then(processFile);
  }));
};

module.exports.loadSongsFromDirectory = function(dir) {
  mongoose.connect(mongoConfig.uri); // saves will automatically wait for this

  fs.readdirAsync(dir)
    .then(parseFiles)
    .catch(function(err) {
      console.log(err) // catch all errors/rejections to ensure db is closed
  }).then(function() {
      console.log('Closing DB connection');
      mongoose.connection.close();
  });
};
