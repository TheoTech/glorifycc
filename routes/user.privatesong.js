var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mongoose = require('mongoose');
var PrivateSong = require('../models/privateSong');
var _ = require('lodash');


router.get('/', function(req, res) {
    PrivateSong.find(function(err, songs) {
        if (err) return handleError(err)
        console.log(songs)
        res.render('privateSong', {
            songs: songs
        })
    })
})

router.get('/add', function(req, res) {
    res.render('addPrivateSong', {})
})


router.post('/add', function(req, res) {
    var title = req.body.title
    var lyricArray = req.body.lyric.split(/\r?\n|\//)
    req.checkBody('title', 'Title cannot be empty').notEmpty();
    req.checkBody('author', 'Author cannot be empty').notEmpty();
    req.checkBody('lyric', 'Lyric cannot be empty').notEmpty();

    var errors = req.validationErrors()
    if (errors) {
        res.render('addPrivateSong', {
            errors: errors
        })
    } else {
        PrivateSong.findOne({
            title: title
        }, function(err, song) {
            if (err) {
                res.status(400).send('error ' + err)
            }
            if (song) {
                res.render('addPrivateSong', {
                    errors: ['Song Exists'],
                    song: song
                });
            } else {
                var newSong = new PrivateSong({
                    title: title,
                    author: req.body.author,
                    lang: req.body.lang,
                    lyric: lyricArray,
                    timeAdded: Date.now()
                })
                newSong.save(function(err) {
                    if (err) {
                        res.status(400).send('error saving new song ' + err)
                    } else {
                        res.redirect('/user/privatesong')
                    }
                })
            }
        })
    }
})

router.route('/:song_id')
    .all(function(req, res, next) {
        lang = req.query.lang || ''
        songID = req.params.song_id
        song = {}
        PrivateSong.findById(songID, function(err, s) {
            song = s;
            next()
        })
    })
    .get(function(req, res) {
        PrivateSong.findById(songID, function(err, song) {
            if (err) return handleError(err)
            PrivateSong.find({
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
                var rightTranslation = translations.find((translation) => translation.lang === lang) || {}
                var isTranslationExisted = !_.isEmpty(rightTranslation)
                res.render('song', {
                    song: song,
                    rightTranslation: rightTranslation,
                    isTranslationExisted: isTranslationExisted,
                    translations: translations
                })
            })
        })
    })

router.route('/:song_id/add-translation')
    .all(function(req, res, next) {
        song_id = req.params.song_id;
        song = {}
        PrivateSong.findById(song_id, function(err, s) {
            song = s;
            next();
        })
    })
    .get(function(req, res) {
        var temp = '';
        song.lyric.forEach(function(s) {
            temp += s + '\n'
        })
        var messages = req.flash('error')
        res.render('addPrivateSongTranslation', {
            song: song,
            stringLyric: temp,
            messages: messages,
            hasErrors: messages.length > 0
        })
    })
    .post(function(req, res) {
        req.checkBody('translationTitle', 'Title is required').notEmpty()
        req.checkBody('translationLyric', 'Lyric is required').notEmpty()
        var messages = req.validationErrors()

        if (messages) {
            res.render('addPrivateSongTranslation', {
                messages: messages
            })
        } else {
            var lang = req.body.translationLang
            console.log(lang)
            var lyricArray = req.body.translationLyric.split(/\r?\n|\//)
            var newSong = new PrivateSong({
                title: req.body.translationTitle,
                author: song.author,
                lang: lang,
                lyric: lyricArray,
                source: song.id,
                timeAdded: Date.now()
            })
            newSong.save(function(err) {
                if (err) {
                    res.status(400).send('error saving new song ' + err)
                } else {
                    res.redirect("/user/privatesong/" + song_id)
                }
            })
        }
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
    })

router.route('/:song_id/edit')
    .all(function(req, res, next) {
        song_id = req.params.song_id
        song = {}
        PrivateSong.findById(song_id, function(err, s) {
            song = s
            next()
        })
    })
    .get(function(req, res) {
        var lyric = song.lyric.reduce((prev, curr, i) => {
            if (i === 0) {
                return curr
            } else {
                return prev + '\n' + curr
            }
        }, '')
        res.render('edit', {
            song: song,
            lyric: lyric
        })
    })
    .post(function(req, res) {
        song.title = req.body.title
        song.author = req.body.author
        song.year = req.body.year
        song.lang = req.body.lang
        song.copyright = req.body.copyright
        song.contributor = req.body.contributor
        song.lyric = (req.body.lyric || '').split(/\r?\n|\//)
        song.save(function(err) {
            if (err) {
                res.status(400).send('Error editing the song: ' + error)
            } else {
                res.redirect('/user/privatesong')
            }
        })
    })


module.exports = router
