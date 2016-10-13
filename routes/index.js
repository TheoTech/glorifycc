var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    _ = require('lodash'),
    Playlist = require('../models/playlist'),
    async = require('async')


router.get('/demo', function(req, res) {
    var temp = ['english', 'spanish', 'portuguese']
    var number = 0
    temp.forEach((t) => {
        Song.find({
            lang: t
        }, function(err, songs) {
            songs.forEach((s) => {
                number++
            })
            console.log(songs)
            console.log(number)
        })
    })
})

router.get('/', function(req, res) {
    console.log()
    var messages = req.flash()
    Song.find(function(err, songs, count) {
            if (err) {
                res.status(400).send('error getting song list ' + err)
            }
            if (req.isAuthenticated()) {
                User.findOne({
                    _id: req.user._id
                }, function(err, user) {
                    if (err) return handleError(err)
                    Playlist.find({
                        owner: req.user._id
                    }, function(err, playlists) {
                        if (err) return handleError(err)
                        res.render('index', {
                            songs: songs,
                            inLibrary: user.library,
                            playlists: playlists,
                            messages: messages
                        })
                    })

                })
            } else {
                res.render('index', {
                    songs: songs,
                    inLibrary: [],
                    playlists: [],
                    messages: messages
                })
            }
        })
        .sort({
            title: 1
        })
        .limit(10)
})

router.put('/', function(req, res) {
    var messages = req.flash()
    var amount = req.body.amount
    var langShown = req.body.langShown
    Song.find({
            lang: langShown
        }, function(err, songs) {
            if (err) {
                res.status(400).send('error getting song list ' + err)
            }
            res.send({
                songs: songs
            })
        })
        .sort({
            title: 1
        })
        .limit(amount)

})

router.post('/', function(req, res) {
    var id = req.body.id
    if (req.isAuthenticated()) {
        User.findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) return handleError(err)
            user.library.push(id)
            user.save(function(err) {
                if (err) return handleError(err)
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

router.delete('/', function(req, res) {
    var id = req.body.id
    User.findOne({
        _id: req.user._id
    }, function(err, user) {
        if (err) return handleError(err)
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
    })
})

router.post('/filter', function(req, res) {
        var langShown = req.body.langShown.toLowerCase()
        var langFilter = req.body.langFilter.map((lf) => lf.toLowerCase())
        var songs2d = []
        var temp = []
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
                    var cbs = songs.map((s, i, arr) => {
                        return function(done) {
                            temp = []
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
                    async.waterfall(cbs, function(err, songs2d) {
                        done(null, songs2d)
                    });
                },
                function(songs2d, done) {
                    songs2d = songs2d.filter((songs) => {
                        var langArray = (songs.map((song) => song.lang))
                        for (var i = 0; i < langFilter.length; i++) {
                            if (!_.includes(langArray, langFilter[i])) {
                                return false
                            }
                        }
                        return true
                    })
                    done(null, songs2d)
                },
                function(songs2d, done) {
                    if (!_.isEmpty(songs2d)) {
                        songs2d = songs2d.reduce((prev, curr) => {
                            return _.concat(prev, curr)
                        })
                    }
                    done(null, songs2d)
                },
                function(songs2d, done){
                  songs2d = songs2d.filter((s) => s.lang === langShown)
                  done(null, songs2d)
                }
            ],
            function(err, songs2d) {
                if (err) return handleError(err)
                res.send({
                    songs: songs2d
                })
            })
    })

router.get('/search', function(req, res) {
    var tag = req.query.q
    var messages = req.flash()
    Song.find({
            $text: {
                $search: "\"" + tag + "\""
            }
        }, function(err, songs, count) {
            if (err) {
                res.status(400).send('error getting song list ' + err)
            }
            if (req.isAuthenticated()) {
                User.findOne({
                    _id: req.user._id
                }, function(err, user) {
                    if (err) return handleError(err)
                    Playlist.find({
                        owner: req.user._id
                    }, function(err, playlists) {
                        if (err) return handleError(err)
                        res.render('index', {
                            songs: songs,
                            inLibrary: user.library,
                            playlists: playlists,
                            messages: messages
                        })
                    })

                })
            } else {
                res.render('index', {
                    songs: songs,
                    inLibrary: [],
                    playlists: [],
                    messages: messages
                })
            }
        })
        .sort({
            title: 1
        })
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
        console.log(song._id)
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
            var rightTranslation = translations.find((translation) => translation.lang === lang) || {}
            var isTranslationExisted = !_.isEmpty(rightTranslation)
            if (req.isAuthenticated()) {
                Playlist.find({
                    owner: req.user._id
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
        req.checkBody('title_t', 'Title is required').notEmpty()
        req.checkBody('lyric_t', 'Lyric is required').notEmpty()
        var messages = req.validationErrors()

        if (messages) {
            res.render('addTranslation', {
                messages: messages
            })
        } else {
            var lang = req.body.lang_t
            var stringArr_t = req.body.lyric_t.split(/\r?\n|\//)
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
