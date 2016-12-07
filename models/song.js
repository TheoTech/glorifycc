//source is the id of the parent
//if source undefined then it is the parent
var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var songSchema = new Schema({
    title: String,
    author: String,
    year: String,
    lang: {
        type: Schema.Types.ObjectId,
        ref: 'Language'
    },
    translator: String,
    contributor: String,
    copyright: String,
    youtubeLink: String,
    lyric: [
        [String]
    ],
    source: Schema.Types.ObjectId,
    oriSong: String,
    timeAdded: Date
})

module.exports = mongoose.model('Song', songSchema)
