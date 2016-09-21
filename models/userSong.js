var mongoose = require('mongoose'),
    Schema = mongoose.Schema

// var userSongSchema = new Schema({
//     owner: String,
//     library: [{type: Schema.Types.ObjectId, ref: 'LibrarySongcart'}],
//     songcart: [{type: Schema.Types.ObjectId, ref: 'LibrarySongcart'}]
// })

var userSongSchema = new Schema({
    owner: String,
})

module.exports = mongoose.model('UserSong', userSongSchema)
