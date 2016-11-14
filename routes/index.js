var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    _ = require('lodash'),
    Playlist = require('../models/playlist'),
    async = require('async');

var fs = require('file-system');
var officegen = require('officegen');
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
        subject: 'Question about glorify.cc',
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
            copyright: {
                $ne: 'private'
            }
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



router.post('/', function(req, res, next) {
    var id = req.body.id
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
                    copyright: {
                        $ne: 'private'
                    }
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
                            playlists: playlists
                        })
                    })
                })
            } else {
                res.render('search', {
                    songs: songs2d,
                    inLibrary: [],
                    playlists: []
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
            playlists: []
        })
    }
})

router.get('/discover', function(req, res, next) {
    var playlistName = req.query.playlist || ''
    var messages = req.flash();
    var langsExist;
    var messages = req.flash()
    Song.find({
            copyright: {
                $ne: 'private'
            }
        }, function(err, songs, count) {
            if (err) {
                res.status(400).send('error getting song list ' + err)
            }
            //to get what languages we need to include in the dropdown for filtering feature
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
                        res.render('discover', {
                            songs: songs,
                            inLibrary: user.library,
                            playlists: playlists,
                            messages: messages,
                            langsExist: langsExist,
                            playlistName: playlistName
                        })
                    })
                })
            } else {
                res.render('discover', {
                    songs: songs,
                    inLibrary: [],
                    playlists: [],
                    messages: messages,
                    langsExist: langsExist,
                    playlistName: playlistName
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

    //find all parent songs
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
                    copyright: {
                        $ne: 'private'
                    }
                },
                function(err, songs) {
                    done(err, songs)
                })
        } else {
            Song.find({
                    source: {
                        $exists: false
                    },
                    copyright: {
                        $ne: 'private'
                    }
                },
                function(err, songs) {
                    done(err, songs)
                })
        }
    }

    //find all children songs for every parent song
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
                        copyright: {
                            $ne: 'private'
                        }
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

    //apply 'show songs that have translations in' filter
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

    //turn 2d array to 1d array
    var concatSongs = function(songs2d, done) {
        if (!_.isEmpty(songs2d)) {
            songs2d = _.sortBy(songs2d.reduce((prev, curr) => {
                return _.concat(prev, curr)
            }), ['title'])
        }
        done(null, songs2d)
    }

    //apply 'show songs in' filter
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

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/user/login')
    }
}
