//source is the id of the parent
//if source undefined then it is the parent
var mongoose = require('mongoose'),
    Schema = mongoose.Schema


var langSchema = new Schema({
    lang: String
})

module.exports = mongoose.model('Language', langSchema)
