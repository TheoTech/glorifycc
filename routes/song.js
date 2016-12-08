var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var User = require('../models/user');
var _ = require('lodash');
var Playlist = require('../models/playlist');
var Language = require('../models/language');
var passportFunction = require('../lib/passport');
var Language = require('../models/language');
var createDefaultSong = require('../lib/createDefaultSong');
var copyrightLists = require('../lib/copyrightConstant');


router.route('/:song_id')
    .all(function(req, res, next) {
        lang = req.query.lang || ''
        song_id = req.params.song_id
        song = {}
        Song.findById(song_id)
            .populate('lang')
            .exec(function(err, s) {
                song = s;
                next()
            })
    })
    .get(function(req, res, next) {
        if (song.copyright === 'private') {
            if (!req.isAuthenticated()) {
                //if the user is not logged in, dont show the song
                res.render('noaccess')
            } else if (song.contributor === req.user.username || passportFunction.isAdmin) {
                // if the user is the song contributor or the admin, then show the song
                findSong()
            } else {
                //otherwise dont show the song
                res.render('noaccess')
            }
        } else {
            //if it is not a private song then show the song
            findSong()
        }

        function findSong() {

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
                                $ne: song.lang._id
                            }
                        }]
                    }, {
                        _id: song.source
                    }, {
                        source: song._id
                    }]
                })
                .populate('lang')
                .exec(function(err, translations) {
                    if (err) {
                        res.status(400).send('Error getting songs ' + err)
                    }
                    console.log(translations)
                        //The user sees a song on the left. If they want to view a translation, it appears on the right.
                        //rightTranslation is the song obj in the language that the user picks in the dropdown
                    var rightTranslation = translations.find((translation) => translation.lang._id == lang) || {}
                    var translationExists = !_.isEmpty(rightTranslation)
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
                                res.render('song', {
                                    song: song,
                                    rightTranslation: rightTranslation,
                                    translationExists: translationExists,
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
                            translationExists: translationExists,
                            translations: translations,
                            playlists: [],
                            inLibrary: []
                        })
                    }
                })
        }
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
        Song.findById(song_id)
        .populate('lang')
        .exec(function(err, s) {
            song = s;
            next();
        })
    })
    .get(function(req, res, next) {
        if (req.isAuthenticated()) {
            if (song.contributor !== req.user.username && !passportFunction.isAdmin) {
                res.render('noaccess')
            } else {
                Language.find(function(err, languages) {
                    if (err) next(err)
                    createDefaultSong(function(defaultSong) {
                        console.log(defaultSong)
                        res.render('addTranslation', {
                            song: song,
                            availableLanguages: languages,
                            defaultSongObj: defaultSong,
                            copyrightLists: copyrightLists
                        })
                    })
                })
            }
        } else {
            res.redirect('/user/login')
        }

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
                            data.lyric.push([''])
                        }
                    }
                    var newSong = new Song({
                        title: data.title,
                        author: data.author,
                        year: data.year,
                        translator: data.translator,
                        lyric: data.lyric,
                        lang: data.lang,
                        youtubeLink: data.youtubeLink,
                        contributor: req.user.username,
                        copyright: data.copyright,
                        timeAdded: Date.now()
                    })

                    /*
                      We have two cases: when a translation is added to an original versus when a translation is added to
                      a translation of an original. In the first case the source of the original will be null, so we can
                      attach this as a translation of that source. In the second case, the source of the original will
                      point to the true original song and we should make this a translation of that.
                    */
                    if (!song.source) {
                        //the user adds the translation to parent song
                        newSong.source = song._id
                    } else {
                        //the user adds the translation to child song
                        newSong.source = song.source
                    }
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


router.route('/:song_id/edit')
    .all(passportFunction.loggedIn, function(req, res, next) {
        song_id = req.params.song_id;
        song = {};
        Song.findById(song_id)
            .populate('lang')
            .exec(function(err, s) {
                song = s;
                next();
            });
    })
    .get(function(req, res, next) {
        if (song.contributor !== req.user.username && !passportFunction.isAdmin) {
            res.render('noaccess')
        } else {
            Language.find(function(err, languages) {
                if (err) next(err)
                res.render('edit', {
                    availableLanguages: languages,
                    song: song,
                    copyrightLists: copyrightLists
                })
            })
        }
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
            song.title = data.title
            song.author = data.author
            song.year = data.year
            song.lang = data.lang
            song.copyright = data.copyright
            song.lyric = data.lyric
            song.save(function(err) {
                if (err) {
                    res.status(400).send('Error editing the song: ' + error)
                } else {
                    res.send({
                        url: '/songlist-db'
                    })
                }
            })
        }
    })


module.exports = router;
