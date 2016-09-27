var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var playlistSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: String,
    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }]
})

module.exports = mongoose.model('Playlist', playlistSchema)
