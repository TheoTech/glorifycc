var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var mongoose = require('mongoose');
var mongoConfig = require('../lib/mongoConfig');
var Song = require('../models/song');

var now = new Date();

var getTranslationsFromFileData = function(data) {
  translations = JSON.parse(data);

  translations.forEach(function(translation) {
    translation.timeAdded = now;
  });

  return translations;
}

/**
 * Saves contents of song file to DB
 * @param {string} data translations of a song (including original) as JSON array
 *   - the original must be the first element
 * @return {Promise}
 *   if fulfilled, contains undefined
 *   if rejected, contains an error string
 */
var saveFileData = function(data) {
  var translations = getTranslationsFromFileData(data);
  var baseSong = new Song(translations.shift());

  return baseSong.save() // save base song
    .catch(function(err) { // rethrow error with additional details
      return Promise.reject('Could not save base song. Reason:\n' + err);
  }).then(function(original) {
      // update source to point to baseSong before saving
      translations.forEach(function (translation) {
        translation.source = original.id;
      });
      return Song.create(translations); // save all translations
      // this returns a promise for async db call
  }).catch(function(err) { // rethrow error with additional details
      return Promise.reject('Could not save all translations of "'
          + baseSong.title + '". Reason:\n' + err);
  }).then(function() {
      // all saves have been completed successfully
      // we don't need to return anything
      console.log('Saved all translations of "' + baseSong.title + '"');
  });
};

var saveFiles = function(baseDir, files) {
  return Promise.all(files.map(function(filename) {
    var filePath = path.join(baseDir, filename);

    return fs.readFileAsync(filePath, 'utf8')
      .then(saveFileData);
  }));
};

/**
 * For a given directory, load every file in that directory as a separate
 * original song.
 * Each file will consist of an array of all translations of the song.  The
 * original must be at position 0 in the array.
 * Each element in the array is a Song object to be uploaded to the database.
 * Song properties dateAdded and source will be added to the object
 * automatically.  The source will point to the element at position 0, and be
 * unspecified for that element itself.
 */
module.exports.loadSongsFromDirectory = function(dir) {
  mongoose.connect(mongoConfig.uri); // saves will automatically wait for this

  fs.readdirAsync(dir)
    .then(function(files) {
      return saveFiles(dir, files);
  }).catch(function(err) {
      console.log(err); // catch all errors/rejections to ensure db is closed
  }).then(function() {
      console.log('Closing DB connection');
      mongoose.connection.close();
  });
};
