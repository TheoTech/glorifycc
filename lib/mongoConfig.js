var mongoose = require('mongoose');

var MongoURI = process.env.MONGOURI || 'mongodb://localhost/song-database';
mongoose.Promise = global.Promise;

module.exports = {uri: MongoURI};
