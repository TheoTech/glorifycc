var Language = require('../models/language')

var song = {
    title: '',
    author: '',
    translator: '',
    year: '',
    copyright: 'private',
    youtubeLink: '',
    lyric: []
}

Language.findOne({
    code: 'en'
}, (err, language) => {
    song.lang = language
    module.exports.song = song
})
