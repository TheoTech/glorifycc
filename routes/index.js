var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    _ = require('lodash'),
    Playlist = require('../models/playlist'),
    async = require('async');

var fs = require('file-system');
var officegen = require('officegen');
var async = require('async');
var nodemailer = require('nodemailer')
var config = require('config')

router.post('/contactus', function(req, res, next) {
    var name = req.body.name
    var email = req.body.email
    var question = req.body.question
    var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
            user: process.env.SENDGRID_USER || config.get('emailVerification.user'),
            pass: process.env.SENDGRID_PASS || config.get('emailVerification.pass')
        }
    });
    var mailOptions = {
        to: 'jonathanardewanta@hotmail.com',
        from: email,
        subject: 'Question',
        text: question
    };
    smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'Your question has been successfully sent');
        res.redirect('/')
    });
})


router.get('/', function(req, res, next) {
    var messages = req.flash();
    var langsExist;
    Song.find({
            private: false
        }, function(err, songs, count) {
            if (err) {
                res.status(400).send('error getting song list ' + err)
            }
            //to get the what languages we need to include in the dropdown for filtering feature
            langsExist = _.uniq(songs.map((s) => s.lang))
            if (req.isAuthenticated()) {
                User.findOne({
                    _id: req.user._id
                }, function(err, user) {
                    if (err) next(err)
                    Playlist.find({
                        owner: req.user._id,
                        song: {
                            $exists: false
                        }
                    }, function(err, playlists) {
                        if (err) next(err)
                        res.render('index', {
                            songs: songs,
                            inLibrary: user.library,
                            playlists: playlists,
                            messages: messages,
                            langsExist: langsExist,
                            isLoggedIn: true
                        })
                    })
                })
            } else {
                res.render('index', {
                    songs: songs,
                    inLibrary: [],
                    playlists: [],
                    messages: messages,
                    langsExist: langsExist,
                    isLoggedIn: false
                })
            }
        })
        .sort({
            title: 1
        })
        .limit(10)
})

router.put('/discover', function(req, res, next) {
    var langShown = req.body.langShown
    var langFilter = req.body.langFilter
    var searchString = req.body.searchString
    var totalSongsDisplayed = req.body.totalSongsDisplayed
    var songs2d = []
    var findOriginalSong = function(done) {
        var query = new RegExp('.*' + searchString + '.*')
        if (searchString) {
            Song.find({
                    source: {
                        $exists: false
                    },
                    $or: [{
                        title: {
                            $regex: query,
                            $options: 'si'
                        }
                    }, {
                        author: {
                            $regex: query,
                            $options: 'si'
                        }
                    }, {
                        lyric: {
                            $regex: query,
                            $options: 'si'
                        }
                    }],
                    private: false
                },
                function(err, songs) {
                    done(err, songs)
                })
        } else {
            Song.find({
                    source: {
                        $exists: false
                    },
                    private: false
                },
                function(err, songs) {
                    done(err, songs)
                })
        }
    }

    var findTranslations = function(songs, done) {
        if (_.isEmpty(songs)) {
            done(null, [])
        } else {
            var task = songs.map((s, i, arr) => {
                return function(done) {
                    var temp = []
                    temp.push(s)
                    Song.find({
                        source: s._id,
                        private: false
                    }, (err, translations) => {
                        translations.forEach((t) => {
                            temp.push(t)
                        })
                        songs2d.push(temp)
                        if (i === arr.length - 1) {
                            done(null, songs2d)
                        } else {
                            done()
                        }
                    })
                }
            });
            async.waterfall(task, function(err, songs2d) {
                done(null, songs2d)
            });
        }
    }

    var applyFilter = function(songs2d, done) {
        if (!_.isEmpty(langFilter)) {
            songs2d = songs2d.filter((songs) => {
                var langArray = (songs.map((song) => song.lang))
                for (var i = 0; i < langFilter.length; i++) {
                    if (!_.includes(langArray, langFilter[i])) {
                        return false
                    }
                }
                return true
            })
        }
        done(null, songs2d)
    }

    var concatSongs = function(songs2d, done) {
        if (!_.isEmpty(songs2d)) {
            songs2d = _.sortBy(songs2d.reduce((prev, curr) => {
                return _.concat(prev, curr)
            }), ['title'])
        }
        done(null, songs2d)
    }

    var loadMore = function(songs2d, done) {
        if (langShown !== 'all') {
            songs2d = songs2d.filter((s) => s.lang === langShown)
        }
        if (songs2d.length >= totalSongsDisplayed) {
            songs2d = songs2d.slice(0, totalSongsDisplayed)
        }
        done(null, songs2d)
    }

    var finalize = function(err, songs2d) {
        if (err) {
            res.status(500).send('Internal error' + err)
            console.log(err)
        } else {
            res.send({
                songs: songs2d
            })
        }
    }

    async.waterfall([findOriginalSong, findTranslations, applyFilter, concatSongs, loadMore], finalize)

})

router.post('/', function(req, res, next) {
    var id = req.body.id
    if (req.isAuthenticated()) {
        User.findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) next(err)
            user.library.push(id)
            user.save(function(err) {
                if (err) next(err)
                res.send({
                    inLibrary: user.library
                })
            })
        })
    } else {
        res.send({
            url: '/user/login'
        })
    }
})

router.delete('/', function(req, res, next) {
    var id = req.body.id
    User.findOne({
        _id: req.user._id
    }, function(err, user) {
        if (err) next(err)
        var index = user.library.indexOf(id)
        if (index > -1) {
            user.library.splice(index, 1)
        }
        user.save(function(err) {
            if (err) next(err)
            console.log('delete success')
            res.send({
                inLibrary: user.library
            })
        })
    })
})

router.post('/filter', function(req, res, next) {
    var langShown = req.body.langShown.toLowerCase()
    var langFilter = req.body.langFilter.map((lf) => lf.toLowerCase())
    var totalSongsDisplayed = req.body.totalSongsDisplayed
    var songs2d = []
    async.waterfall([
            function(done) {
                Song.find({
                    source: {
                        $exists: false
                    }
                }, function(err, songs) {
                    done(err, songs)
                })
            },
            function(songs, done) {
                var task = songs.map((s, i, arr) => {
                    return function(done) {
                        var temp = []
                        temp.push(s)
                        Song.find({
                            source: s._id
                        }, (err, translations) => {
                            translations.forEach((t) => {
                                temp.push(t)
                            })
                            songs2d.push(temp)
                            if (i === arr.length - 1) {
                                done(null, songs2d)
                            } else {
                                done()
                            }
                        })
                    }
                });
                async.waterfall(task, function(err, songs2d) {
                    done(null, songs2d)
                });
            },
            function(songs2d, done) {
                console.log(songs2d)
                if (!_.isEmpty(langFilter)) {
                    songs2d = songs2d.filter((songs) => {
                        var langArray = (songs.map((song) => song.lang))
                        for (var i = 0; i < langFilter.length; i++) {
                            if (!_.includes(langArray, langFilter[i])) {
                                return false
                            }
                        }
                        return true
                    })
                }
                done(null, songs2d)
            },
            function(songs2d, done) {
                if (!_.isEmpty(songs2d)) {
                    songs2d = songs2d.reduce((prev, curr) => {
                        return _.concat(prev, curr)
                    }).sort()
                }
                done(null, songs2d)
            },
            function(songs2d, done) {
                if (langShown !== 'all') {
                    songs2d = songs2d.filter((s) => s.lang === langShown)
                }
                console.log(songs2d.length)
                if (songs2d.length >= totalSongsDisplayed) {
                    songs2d = songs2d.slice(0, totalSongsDisplayed)
                } else {
                    songs2d = songs2d.slice(0, songs2d.length)
                }
                done(null, songs2d)
            }
        ],
        function(err, songs2d) {
            if (err) next(err)
            res.send({
                songs: songs2d
            })
        })
})

router.get('/help', function(req, res, next) {
    res.render('help', {})
})

router.get('/help/createslide', function(req, res, next) {
    res.render('help-createSlide', {})
})

router.get('/help/addingsongs', function(req, res, next) {
    res.render('help-addingSongs', {})
})

router.get('/search', function(req, res, next) {
    // var messages = req.flash();
    // if (!searchString) {
    //     var messages = req.flash();
    //     var langsExist;
    //     var messages = req.flash()
    //     Song.find({
    //             private: false
    //         }, function(err, songs, count) {
    //             if (err) {
    //                 res.status(400).send('error getting song list ' + err)
    //             }
    //             //to get the what languages we need to include in the dropdown for filtering feature
    //             langsExist = _.uniq(songs.map((s) => s.lang))
    //         })
    //         .sort({
    //             title: 1
    //         })
    //         .limit(10)
    // } else {
    var searchString = req.query.q
    var langShown = req.body.langShown
    var langFilter = req.body.langFilter
    var totalSongsDisplayed = req.body.totalSongsDisplayed
    var songs2d = []
    var findOriginalSong = function(done) {
        var query = new RegExp('.*' + searchString + '.*')
        Song.find({
                    $or: [{
                        title: {
                            $regex: query,
                            $options: 'si'
                        }
                    }, {
                        author: {
                            $regex: query,
                            $options: 'si'
                        }
                    }, {
                        lyric: {
                            $regex: query,
                            $options: 'si'
                        }
                    }],
                    private: false
                },
                function(err, songs) {
                    done(null, songs)
                })
            .sort({
                title: 1
            })
    }

    var finalize = function(err, songs2d) {
        if (err) {
            res.status(500).send('Internal error' + err)
        } else {
            if (req.isAuthenticated()) {
                User.findOne({
                    _id: req.user._id
                }, function(err, user) {
                    if (err) next(err)
                    Playlist.find({
                        owner: req.user._id,
                        song: {
                            $exists: false
                        }
                    }, function(err, playlists) {
                        if (err) next(err)
                        res.render('search', {
                            songs: songs2d,
                            inLibrary: user.library,
                            playlists: playlists,
                            // messages: messages,
                            // langsExist: langsExist,
                        })
                    })
                })
            } else {
                res.render('search', {
                    songs: songs2d,
                    inLibrary: [],
                    playlists: [],
                    // messages: messages,
                    // langsExist: langsExist,
                })
            }
        }
    }

    if (searchString) {
        async.waterfall([findOriginalSong], finalize)
    } else {
        res.render('search', {
            songs: [],
            inLibrary: [],
            playlists: [],
            // messages: messages,
            // langsExist: langsExist,
        })
    }
})

router.get('/discover', function(req, res, next) {
    var messages = req.flash();
    var langsExist;
    var messages = req.flash()
    Song.find({
            private: false
        }, function(err, songs, count) {
            if (err) {
                res.status(400).send('error getting song list ' + err)
            }
            //to get the what languages we need to include in the dropdown for filtering feature
            langsExist = _.uniq(songs.map((s) => s.lang))
            if (req.isAuthenticated()) {
                User.findOne({
                    _id: req.user._id
                }, function(err, user) {
                    if (err) next(err)
                    Playlist.find({
                        owner: req.user._id,
                        song: {
                            $exists: false
                        }
                    }, function(err, playlists) {
                        if (err) next(err)
                        res.render('songlist', {
                            songs: songs,
                            inLibrary: user.library,
                            playlists: playlists,
                            messages: messages,
                            langsExist: langsExist,
                            isLoggedIn: true
                        })
                    })
                })
            } else {
                res.render('songlist', {
                    songs: songs,
                    inLibrary: [],
                    playlists: [],
                    messages: messages,
                    langsExist: langsExist,
                    isLoggedIn: false
                })
            }
        })
        .sort({
            title: 1
        })
        .limit(10)
})

router.route('/song/:song_id')
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
    .get(isLoggedIn, function(req, res, next) {
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
    .post(function(req, res, next) {
        req.checkBody('translationTitle', 'Title is required').notEmpty()
        req.checkBody('translationLyric', 'Lyric is required').notEmpty()
        var messages = req.validationErrors()

        if (messages) {
            res.render('addTranslation', {
                messages: messages
            })
        } else {
            console.log('hehhee')
            var lang = req.body.translationLang
            var translationLyricArray = req.body.translationLyric.split(/\r?\n|\//)
            Song.findOne({
                    source: song.id,
                    lang: lang
                }, function(err, translation) {
                    if (err) {
                        res.status(400).send('error ' + err)
                    }
                    var newSong = new Song({
                            title: req.body.translationTitle,
                            author: song.author,
                            year: song.year,
                            lang: lang,
                            contributor: req.user.username,
                            translator: req.body.translator,
                            copyright: req.body.translationCopyright,
                            lyric: translationLyricArray.slice(0),
                            source: song.id,
                            oriSong: song.title,
                            timeAdded: Date.now()
                        })
                        // if (translation) {
                        //     newSong.v = translation.v + 1
                        // } else {
                        //     newSong.v = 1;
                        // }
                    newSong.save(function(err) {
                        if (err) {
                            res.status(400).send('error saving new song ' + err)
                        } else {
                            res.redirect('/' + song_id)
                        }
                    })
                })
                .sort({
                    _id: -1
                }).limit(1)
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

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/user/signup')
    }
}
