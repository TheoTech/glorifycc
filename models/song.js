var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var songSchema = new Schema({
    title: String,
    author: String,
    year: String,
    language: String,
    copyright: String,
    lyric: String
})

module.exports = mongoose.model('Song', songSchema)
