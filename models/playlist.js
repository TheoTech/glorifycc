var mongoose = require('mongoose'),
    Schema = mongoose.Schema

// var userSongSchema = new Schema({
//     owner: String,
//     library: [{type: Schema.Types.ObjectId, ref: 'LibrarySongcart'}],
//     songcart: [{type: Schema.Types.ObjectId, ref: 'LibrarySongcart'}]
// })

var playlistSchema = new Schema({
  name: String,
  songs: [{
      Schema.Types.ObjectId,
      ref: 'Song'
  }]
})

module.exports = mongoose.model('Playlist', playlistSchema)
