/*
  this script migrates lang field in song schema
  current state:
  Song = [{
    lang: 'english' (String)
    }]

  State after migration:
  Song = [{
      lang: '583542a45a6ce200126f02fc' (Language ObjectID)
  }]

  Language = {
      label: 'English', (String)
      code: 'en' (String)
  }

  Solution:
      1. change Song.lang to the id reference of the language schema
      2. update the lang field in Song.js under models folder to have {
          type: Schema.Types.ObjectId,
          ref: 'Language'
      } instead of String
*/

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Song = require('../models/song');
var Language = require('../models/language');
var config = require('config');

var MongoURI = process.env.MONGOURI || config.get('mLabDatabaseURI');
mongoose.connect(MongoURI, function(err, database) {
    if (err) {
        console.log('Error connecting to: ' + MongoURI + '. ' + err);
    } else {
        function updateSong(song, code, info, i, length) {
            Language.findOne({
                code: code
            }, (err, language) => {
                song.lang = language._id;
                song.save((err) => {
                    if (err) {
                        console.log('Error migrating ' + song.title);
                        info.error++
                    } else {
                        console.log('Migrating ' + song.title + ': change the lang field from ' + code + ' to ' + language._id);
                        info.success++
                    }
                    if (i === length - 1) {
                        console.log('\nTotal songs: ' + length)
                        console.log(info.success + ' songs migrated successfully, ' + info.error + ' errors')
                        console.log('\nClosing DB connection');
                        mongoose.connection.close();
                    }
                });
            });
        }

        Song.find((err, songs) => {
            var info = {
                success: 0,
                error: 0
            };
            var length = songs.length;
            songs.forEach((song, i) => {
                if (song.lang === 'english') {
                    updateSong(song, 'en', info, i, length);
                } else if (song.lang === 'spanish') {
                    updateSong(song, 'es', info, i, length);
                } else if (song.lang === 'bahasa') {
                    updateSong(song, 'id', info, i, length);
                }
            });
        });
    }
});
