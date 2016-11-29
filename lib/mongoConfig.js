var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var MongoURI = process.env.MONGOURI || 'mongodb://localhost/song-database';

module.exports = {uri: MongoURI};
