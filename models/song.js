//source is the id of the parent
//if source undefined then it is the parent
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
    v: Number,
    oriSong: String,
    timeAdded: Date
})

module.exports = mongoose.model('Song', songSchema)
