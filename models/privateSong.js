//source is the id of the parent
//if source undefined then it is the parent
var mongoose = require('mongoose'),
    Schema = mongoose.Schema


var privateSongSchema = new Schema({
    title: String,
    author: String,
    lang: String,
    lyric: [String],
    source: Schema.Types.ObjectId,
    timeAdded: Date
})

module.exports = mongoose.model('PrivateSong', privateSongSchema)
