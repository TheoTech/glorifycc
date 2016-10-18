var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var songSchema = new Schema({
    title: String,
    author: String,
    year: String,
    lang: String,
    contributor: String,
    copyright: String,
    lyric: [String],
    source: Schema.Types.ObjectId,
    oriSong: String,
    timeAdded: Date
})

module.exports = mongoose.model('Song', songSchema)
