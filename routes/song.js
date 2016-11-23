var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    _ = require('lodash'),
    Playlist = require('../models/playlist')
Language = require('../models/language')

router.route('/:song_id')
    .all(function(req, res, next) {
        lang = req.query.lang || ''
            // v = req.query.v || ''
        song_id = req.params.song_id
        song = {}
        Song.findById(song_id, function(err, s) {
            song = s;
            next()
        })
    })
    .get(function(req, res, next) {
        Song.find({
            $or: [{
                $and: [{
                    source: song.source
                }, {
                    source: {
                        $exists: true
                    }
                }, {
                    lang: {
                        $ne: song.lang
                    }
                }]
            }, {
                _id: song.source
            }, {
                source: song._id
            }]
        }, function(err, translations) {
            if (err) {
                res.status(400).send('Error getting songs ' + err)
            }

            //rightTranslation is the song obj in the language that the user picks in the dropdown
            var rightTranslation = translations.find((translation) => translation.lang === lang) || {}
            var isTranslationExisted = !_.isEmpty(rightTranslation)
            if (req.isAuthenticated()) {
                Playlist.find({
                    owner: req.user._id,
                    song: {
                        $exists: false
                    }
                }, function(err, playlists) {
                    User.findOne({
                        _id: req.user._id
                    }, function(err, user) {
                        console.log(user.library)
                        res.render('song', {
                            song: song,
                            rightTranslation: rightTranslation,
                            isTranslationExisted: isTranslationExisted,
                            translations: translations,
                            playlists: playlists,
                            inLibrary: user.library
                        })
                    })

                })
            } else {
                res.render('song', {
                    song: song,
                    rightTranslation: rightTranslation,
                    isTranslationExisted: isTranslationExisted,
                    translations: translations,
                    playlists: [],
                    inLibrary: []
                })
            }
        })
    })
    //choosing translations
    .put(function(req, res, next) {
        var lang = req.body.lang
        var leftColumnSongID = req.body.parentSongID
        Song.findById(leftColumnSongID, function(err, song) {
            if (err) return next(err)
            if (!song.source) {
                //then leftColumnSong is parent song in the Song Schema
                //find one
                Song.findOne({
                    source: leftColumnSongID,
                    lang: lang
                }, function(err, translation) {
                    if (err) return next(err)
                    res.send({
                        translation: translation
                    })
                })
            } else {
                Song.findOne({
                    lang: lang,
                    $or: [{
                        source: song.source,
                    }, {
                        _id: song.source
                    }]
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
    .get(function(req, res, next) {
        Language.find(function(err, languages) {
            if (err) next(err)
            res.render('addTranslation', {
                song: song,
                availableLanguages: languages.map((language) => language.lang)
            })
        })
    })
    .post(function(req, res, next) {
        req.checkBody('title', 'Title is empty').notEmpty()
        req.checkBody('author', 'Author is empty').notEmpty()
        req.checkBody('year', 'Year is empty').notEmpty()
        var errors = req.validationErrors()
        if (errors) {
            res.send({
                errorMessages: errors.map((error) => error.msg)
            })
        } else {
            var data = req.body
                //find for all cases, where song is parent song or child song
            Song.findOne({
                $or: [{
                    source: song.source
                }, {
                    _id: song.source
                }, {
                    source: song._id
                }],
                lang: data.lang
            }, function(err, translation) {
                if (err) next(err)
                if (translation || song.lang === data.lang) {
                    res.send({
                        errorMessages: ['Translation Exists']
                    })
                } else {
                    var stanzaOffset = song.lyric.length - data.lyric.length
                    if (stanzaOffset > 0) {
                        for (var i = 0; i < stanzaOffset; i++) {
                            song.lyric.push([''])
                        }
                    }
                    var newSong = new Song({
                        title: data.title,
                        author: data.author,
                        year: data.year,
                        lang: data.lang,
                        lyric: data.lyric,
                        contributor: req.user.username,
                        copyright: data.copyright,
                        timeAdded: Date.now(),
                        source: song._id
                    })
                    newSong.save(function(err) {
                        if (err) next(err)
                        if (data.copyright === 'private') {
                            User.findById(req.user._id, function(err, user) {
                                user.library.push(newSong._id)
                                user.save(function(err) {
                                    res.send({
                                        url: '/song/' + song._id
                                    })
                                })
                            })
                        } else {
                            res.send({
                                url: '/song/' + song._id
                            })
                        }
                    })
                }
            })
        }
    })

module.exports = router;
