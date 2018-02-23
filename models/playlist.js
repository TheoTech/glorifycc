var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var playlistSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: String,
    song: {
        type: Schema.Types.ObjectId,
        ref: 'Song'
    },
    translationsChecked: [{
        type: Schema.Types.ObjectId, 
        ref: 'Song'
    }],
    availableTranslations: [{
        type: Schema.Types.ObjectId, 
        ref: 'Song'
    }]
})

module.exports = mongoose.model('Playlist', playlistSchema)
