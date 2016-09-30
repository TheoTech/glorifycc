var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    _ = require('lodash')


router.get('/', function(req, res) {
    langDisplayed = req.query.lang || ['english', 'mandarin', 'spanish', 'portuguese']
    if (req.isAuthenticated()) {
        Song.find({
                lang: {
                    $in: langDisplayed
                }
            }, function(err, songs, count) {
                if (err) {
                    res.status(400).send('error getting song list ' + err)
                }
                User.findOne({
                    _id: req.user._id
                }, function(err, user) {
                    if (err) return handleError(err)
                    res.render('songlist', {
                        songs: songs,
                        inLibrary: user.library
                    })
                })
            })
            .sort({
                timeAdded: -1
            })
    }

})

router.post('/', function(req, res) {
    var id = req.body.id
    if (req.isAuthenticated()) {
        User.findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) return handleError(err)
            User.findOne({
                library: id
            }, function(err, song) {
                if (err) return handleError(err)
                console.log(song)
                if (song) {
                    // console.log('after ' + user.library)
                    var index = user.library.indexOf(id)
                    if (index > -1) {
                        user.library.splice(index, 1)
                    }
                    user.save(function(err) {
                        if (err) return handleError(err)
                        console.log('delete success')
                        res.send({
                            inLibrary: user.library
                        })
                    })
                } else {
                    console.log(id)
                    user.library.push(id)
                    console.log(user.library)
                    user.save(function(err) {
                        if (err) return handleError(err)
                        console.log('save success')
                        res.send({
                            inLibrary: user.library
                        })
                    })
                }
            })
        })
    } else {
        res.send({
            url: '/user/signup'
        })
    }
})



router.route('/:song_id')
    .all(function(req, res, next) {
        lang = req.query.lang || ''
        v = req.query.v || ''
        song_id = req.params.song_id
        song = {}
        Song.findById(song_id, function(err, s) {
            song = s;
            next()
        })
    })
    .get(function(req, res) {
        // console.log(song_id)
        // console.log('version: ' + v)
        Song.find({
            source: song.id
        }, function(err, translations) {
            // console.log(t)
            if (err) {
                res.status(400).send('Error getting songs ' + err)
            }
            if (!translations[0]) {
                console.log('user picks translation song')
                console.log(song)
                Song.find({
                    _id: song.source
                }, function(err, parentSong) {
                    // console.log(parentSong)
                    var parentId
                    parentSong.forEach(function(ps) {
                            translations.push(ps)
                            parentId = ps._id
                        })
                        // console.log(t)
                    console.log(song.source)
                    console.log(parentId)
                    Song.find({
                        source: parentId
                    }, function(err, theRestT) {
                        console.log(theRestT)
                        theRestT.forEach(function(trt) {
                                if (trt.id !== song_id) {
                                    translations.push(trt)
                                }
                            })
                            // console.log(translations)
                        var rightTranslation = translations.find((translation) => translation.lang === lang) || {}
                        var isTranslationExisted = !_.isEmpty(rightTranslation)
                            // console.log(rightTranslation)
                        res.render('song', {
                            song: song,
                            rightTranslation: rightTranslation,
                            isTranslationExisted: isTranslationExisted,
                            translations: translations
                        })
                    })
                })
            } else {
                console.log('user picks ori song')
                var rightTranslation = translations.find((translation) => translation.lang === lang) || {}
                var isTranslationExisted = !_.isEmpty(rightTranslation)
                console.log(rightTranslation)
                res.render('song', {
                    song: song,
                    rightTranslation: rightTranslation,
                    isTranslationExisted: isTranslationExisted,
                    translations: translations
                })
            }

        })
    })

router.route('/:song_id/add-translation')
    .all(function(req, res, next) {
        song_id = req.params.song_id;
        song = {}
        Song.findById(song_id, function(err, s) {
            song = s;
            next();
        })
    })
    .get(isLoggedIn, function(req, res) {
        var temp = '';
        song.lyric.forEach(function(s) {
            temp += s + '\n'
        })
        var messages = req.flash('error')
        res.render('addTranslation', {
            song: song,
            stringLyric: temp,
            messages: messages,
            hasErrors: messages.length > 0
        })
    })
    .post(function(req, res) {
        var lang = req.body.lang_t
        var stringArr_t = req.body.lyric_t.split(/\r?\n|\//)
            // if (stringArr_t.length != song.lyric.length) {
            //     req.flash('error', 'The number of lines in translation lyric must match the number of lines in original song lyric')
            //     if (req.body.title_t === ''){
            //       req.flash('error', 'The title cannot be empty')
            //     }
            //     res.redirect('/songlist/' + song.id + '/add-translation')
            // } else if (req.body.title_t === ''){
            //   req.flash('error', 'The title cannot be empty')
            //     if (stringArr_t.length != song.lyric.length) {
            //       req.flash('error', 'The translation lyric must have the same line with the song lyric')
            //     }
            //     res.redirect('/songlist/' + song.id + '/add-translation')
        Song.findOne({
                source: song.id,
                lang: lang
            }, function(err, translation) {
                if (err) {
                    res.status(400).send('error ' + err)
                }
                var newSong = new Song({
                    title: req.body.title_t,
                    author: song.author,
                    year: song.year,
                    lang: lang,
                    contributor: req.user.username,
                    copyright: req.body.copyright_t,
                    lyric: stringArr_t.slice(0),
                    source: song.id,
                    oriSong: song.title,
                    timeAdded: Date.now()
                })
                if (translation) {
                    newSong.v = translation.v + 1
                } else {
                    newSong.v = 1;
                }
                newSong.save(function(err) {
                    if (err) {
                        res.status(400).send('error saving new song ' + err)
                    } else {
                        res.redirect('/songlist/' + song_id)
                    }
                })
            })
            .sort({
                _id: -1
            }).limit(1)
    })

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/user/signup')
    }
}
