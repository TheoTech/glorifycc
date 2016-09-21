var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var translationSchema = new Schema({
    language: String,
    title: String,
    translator: String,
    lyric: String,
    date: Date,
    singable: Boolean,
    originalSong: {
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }
})

module.exports = mongoose.model('Translation', translationSchema)
