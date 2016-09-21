var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var librarySongcartSchema = new Schema({
      oriSong: {type: Schema.Types.ObjectId, ref: 'Song'},
      translations: [{type: Schema.Types.ObjectId, ref: 'Song'}]
})

module.exports = mongoose.model('LibrarySongcart', librarySongcartSchema)
