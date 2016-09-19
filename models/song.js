var mongoose = require('mongoose'),
    Schema = mongoose.Schema

// var songSchema = new Schema({
//     title: String,
//     author: String,
//     year: String,
//     lang: String,
//     copyright: String,
//     lyric: String,
//     translator: String,
//     dateOfTranslation: Date,
//     source: [Schema.ObjectId]
// })

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
