//this file is for generating a default song obj for the song form that we can import from route and render it to client
var Language = require('../models/language')
//Note: copyright = ['cc0', 'public', 'private']
var copyright = require('../lib/copyrightConstant')

var callback;
var song = {
    title: '',
    author: '',
    translator: '',
    year: '',
    copyright: copyright[2],
    youtubeLink: '',
    lyrics: []
}

Language.findOne({
    code: 'en'
}, (err, language) => {
    song.lang = language
    if (typeof callback == 'function') {
        callback(song)
    }
})

module.exports = function(cb) {
    if (typeof song.lang != '') {
        cb(song);
    } else {
        callback = cb;
    }
}
