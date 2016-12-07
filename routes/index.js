var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var User = require('../models/user');
var _ = require('lodash');
var Playlist = require('../models/playlist');
var async = require('async');
var fs = require('file-system');
var officegen = require('officegen');
var passportFunction = require('../lib/passport');
var smtp = require('../lib/smtp');
var Language = require('../models/language')

router.get('/updateschema', passportFunction.adminLoggedIn, function(req, res, next) {
    // var songs = [{
    //     "lyric": [
    //         "A mighty fortress is our God,",
    //         "A bulwark never failing;",
    //         "Our helper He, amid the flood",
    //         "Of mortal ills prevailing.",
    //         "For still our ancient foe",
    //         "Doth seek to work us woe;",
    //         "His craft and pow'r are great,",
    //         "And, armed with cruel hate,",
    //         "On earth is not his equal.",
    //         '',
    //         "Joy to the World , the Lord is come!",
    //         "Let earth receive her King",
    //         "Let every heart prepare Him room",
    //         "And Heaven and nature sing",
    //         "And Heaven and nature sing",
    //         "And Heaven, and Heaven, and nature sing",
    //         "",
    //         "Joy to the World, the Savior reigns!",
    //         "Let men their songs employ",
    //         "While fields and floods, rocks, hills and plains",
    //         "Repeat the sounding joy",
    //         "Repeat the sounding joy",
    //         "Repeat, repeat, the sounding joy"
    //     ],
    //     private: false
    // }]
    Song.find(function(err, songs) {
        songs.forEach((song, i, arr) => {
            song.temp = 'ahahhaa'
            song.save()
                // console.log(song.year)
                // console.log(song.lang)
                // Language.find({
                //     code: song.lang
                // }, (err, language) => {
                //     if (err) {
                //         res.status(400).send('error: ' + err)
                //     } else {
                //         console.log(i)
                //         console.log(language)
                //         song.lang = language._id
                //         song.save(function(err) {
                //             if (err) next(err)
                //             if (i === arr.length - 1) {
                //                 res.send('migration success')
                //             }
                //         })
                //     }
                // })
        })
    })
})

router.get('/contact', function(req, res, next) {
    res.render('contact')
})

router.post('/contact', function(req, res, next) {
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('message', 'Message is required').notEmpty();
    var email = req.body.email
    var subject = req.body.subject
    var question = req.body.message
    var errors = req.validationErrors()
    if (errors) {
        res.render('contact', {
            errors: errors
        })
    } else {
        var mailOptions = {
            to: process.env.OUR_EMAIL || config.get('ourEmail'),
            from: email,
            subject: (subject === '') ? 'Subject not specified' : subject,
            text: question
        };
        smtp.smtpTransport.sendMail(mailOptions, function(err) {
            if (err) next(err)
            req.flash('success_messages', 'Your message has been successfully sent')
            res.redirect('/contact')
        });
    }
})


router.get('/', function(req, res, next) {
    var messages = req.flash();
    var langsExist;
    Song.find({
            copyright: {
                $ne: 'private'
            }
        }, function(err, songs) {
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

    function findSongsLoggedIn(done) {
        var query = new RegExp('.*' + searchString + '.*')
        Song.find({
                    $and: [{
                        $or: [{
                            title: {
                                $regex: query,
                                $options: 'si' //s option to allow dot character to match all characters including new line
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
                        }]
                    }, {
                        $or: [{
                            copyright: 'private',
                            contributor: req.user.username
                        }, {
                            copyright: {
                                $ne: 'private'
                            }
                        }]
                    }]
                },
                function(err, songs) {
                    done(null, songs)
                })
            .sort({
                title: 1
            })
    }

    function findSongsNotLoggedIn(done) {
        var query = new RegExp('.*' + searchString + '.*')
        Song.find({
                    $or: [{
                        title: {
                            $regex: query,
                            $options: 'si' //s option to allow dot character to match all characters including new line
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

    function findInLibraryAndPlaylist(songs, done) {
        User.findById(req.user._id, function(err, user) {
            if (err) next(err)
            Playlist.find({
                owner: req.user._id,
                song: {
                    $exists: false
                }
            }, function(err, playlists) {
                if (err) next(err)
                done(null, songs, user.library, playlists)
            })
        })
    }

    function finalize(err, songs, inLibrary, playlists) {
        if (err) {
            res.status(500).send('Internal error' + err)
        } else {
            res.render('search', {
                songs: songs,
                inLibrary: inLibrary || [],
                playlists: playlists || []
            })
        }
    }

    if (searchString) {
        if (req.isAuthenticated()) {
            async.waterfall([findSongsLoggedIn, findInLibraryAndPlaylist], finalize)
        } else {
            //if the user not logged in then we dont need to findInLibraryAndPlaylist and just pass empty array
            //for inLibrary and playlists at the render
            async.waterfall([findSongsNotLoggedIn], finalize)
        }
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
        })
        .populate('lang')
        .sort({
            title: 1
        })
        .exec(function(err, songs) {
            if (err) {
                next(err)
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
                //get all the songs lang id, convert it to string so we can compare it later with langFilter
                var langArray = (songs.map((song) => song.lang.toString()))
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
            songs2d = songs2d.filter((s) => s.lang == langShown)
        }
        if (songs2d.length >= totalSongsDisplayed) {
            songs2d = songs2d.slice(0, totalSongsDisplayed)
        }
        done(null, songs2d)
    }

    var finalize = function(err, songs2d) {
        if (err) {
            res.status(500).send('Internal error' + err)
        } else {
            res.send({
                songs: songs2d
            })
        }
    }

    async.waterfall([findOriginalSong, findTranslations, applyFilter, concatSongs, loadMore], finalize)

})

module.exports = router;
