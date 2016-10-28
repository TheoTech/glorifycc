//this model is for storing the songs that are going to be exported
var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var exportSongSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Playlist'
    },
    song: {type: Schema.Types.ObjectId, ref: 'Song'},
    translationsPicked: [{type: Schema.Types.ObjectId, ref: 'Song'}],
    availableTranslations: [{type: Schema.Types.ObjectId, ref: 'Song'}]
})

module.exports = mongoose.model('ExportSong', exportSongSchema)
