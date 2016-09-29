var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Playlist = require('../models/playlist')
var app = require('../app')
var pdf = require('html-pdf')
var fs = require('file-system')
var Song = require('../models/song')
var ExportSong = require('../models/exportSong')
var _ = require('lodash')
var helperFunc = require('../config/passport')


router.get('/library', isLoggedIn, function(req, res, next) {
    User.findOne({
            username: req.user.username
        })
        .populate('library')
        .exec(function(err, user) {
            if (err) return handleError(err)
            Playlist.find({
                owner: user._id
            }, function(err, playlist) {
                if (err) return handleError(err)
                res.render('library', {
                    songs: user.library,
                    playlistLibrary: playlist
                })
            })
        })
})

router.post('/library', function(req, res, next) {
    var name = req.body.name
    var song_id = req.body.id
    Playlist.findOne({
            owner: req.user._id,
            name: name
        })
        .populate('owner')
        .exec(function(err, playlist) {
            var newPlaylist
            if (err) return handleErro(err)
            if (playlist) {
                console.log('playlist exist')
                    // var pl = return userHasThePlaylist.map((a) => a.playlistLibrary.map((b) => b.filter((c) => c.playlistName == name)))
                    // console.log(pl)
                playlist.songs.push(song_id)
                playlist.save(function(err) {
                    if (err) {
                        res.status(400).send('failed ' + err)
                    } else {
                        res.send({
                            url: '/user/library'
                        })
                    }
                })
            } else {
                console.log(playlist)
                var newPlaylist = new Playlist({
                    owner: req.user._id,
                    name: name
                })
                newPlaylist.songs.push(song_id)
                newPlaylist.save(function(err) {
                    if (err) {
                        res.status(400).send('failed ' + err)
                    } else {
                        res.send({
                            url: '/user/library'
                        })
                    }
                })
            }
        })
})

router.delete('/library', function(req, res, next) {
    // var name = req.body.name
    var song_id = req.body.id
    User.findOne({
        _id: req.user._id
    }, function(err, u) {
        if (err) return handleError(err)
        var index = u.library.indexOf(song_id)
        if (index > -1) {
            u.library.splice(index, 1)
        }
        u.save(function(err) {
            if (err) {
                res.status(400).send('error deleting song ' + err)
            } else {
                User.findOne({
                        _id: req.user._id
                    })
                    .populate('library')
                    .exec(function(err, user) {
                        res.send({
                            songs: user.library,
                            msg: 'deleting done'
                        })
                    })

            }
        })
    })
})

router.get('/playlist', function(req, res, next) {
    Playlist.find({
            owner: req.user._id
        })
        .populate('songs')
        .exec(function(err, playlists) {
            if (err) return handleError(err)
            res.render('playlist', {
                playlists: playlists
            })
        })
})

router.post('/playlist', function(req, res, next) {
    var name = req.body.name
    Playlist.findOne({
            owner: req.user._id,
            name: name
        })
        .populate('songs')
        .exec(function(err, playlist) {
            // console.log(JSON.stringify(playlist)
            if (err) return handleError(err)
                // var titles = playlist.songs.map((s) => s.title)
                // var songs = playlist.map((s) => s.songs)
                // console.log(songsTitle)
            res.send({
                songs: playlist.songs,
                name: playlist.name
            })
        })
})

router.delete('/playlist', function(req, res) {
    var songID = req.body.id
    console.log(songID)
    var playlistName = req.body.name
    Playlist.findOne({
        owner: req.user._id,
        name: playlistName
    }, function(err, pl) {
        if (err) return handleError(err)
        var index = pl.songs.indexOf(songID)
        if (index > -1) {
            pl.songs.splice(index, 1)
        }
        ExportSong.remove({
            owner: pl._id,
            song: songID
        }, function(err) {
            pl.save(function(err) {
                if (err) return handleError(err)
                Playlist.findOne({
                        owner: req.user._id,
                        name: playlistName
                    })
                    .populate('songs')
                    .exec(function(err, afterDelete) {
                        res.send({
                            msg: 'deleting done',
                            songs: afterDelete.songs
                        })
                    })
            })
        })

    })
})

router.put('/playlist', function(req, res) {
    var playlistName = req.body.name
    console.log(playlistName)
    Playlist.remove({
        owner: req.user._id,
        name: playlistName
    }, function(err) {
        if (err) return handleError(err)
        res.send({
            url: '/user/playlist'
        })
    })
})


//this route is for step one of exporting playlist
router.get('/playlist/:playlist_name/export1', function(req, res, next) {
    var playlistName = req.params.playlist_name
    var translationss = []
    var langsPicked = []
    Playlist.findOne({
            owner: req.user._id,
            name: playlistName
        })
        .populate('songs')
        .exec(function(err, playlist) {
            if (err) return handleError(err)
                // console.log(playlist.songs)
            playlist.songs.forEach((s, i, arr) => {
                ExportSong.findOne({
                    owner: playlist._id,
                    song: s._id
                }, function(err, es) {
                    if (err) return handleError(err)
                    if (!es) {
                        newExportSong = new ExportSong({
                            owner: playlist._id,
                            song: s._id,
                            translations: []
                        })
                        newExportSong.save(function(err) {
                            if (err) return handleError(err)
                        })
                    } else {
                        langsPicked.push(es.translations)
                    }
                })
                Song.find({
                        $or: [{
                            $and: [{
                                source: s.source
                            }, {
                                source: {
                                    $exists: true
                                }
                            }, {
                                lang: {
                                    $ne: s.lang
                                }
                            }]
                        }, {
                            _id: s.source
                        }, {
                            source: s._id
                        }]
                    },
                    function(err, songs) {
                        if (err) return handleError(err)
                        translationss.push(songs.map((s) => s))
                        if (i == arr.length - 1) {
                            console.log(langsPicked)
                            res.render('export1', {
                                playlistID: playlist._id,
                                playlistName: playlist.name,
                                songs: playlist.songs,
                                translationss: translationss,
                                langsPicked: langsPicked
                            })
                        }
                    })
            })
        })
})


router.post('/playlist/:playlist_name/export1', function(req, res, next) {
    // console.log(req.body)
    var playlistID = req.body.playlistID
    var songID = req.body.songID
    var translationID = req.body.translationID
        // console.log(songID)
        // res.send({msg: 'saving'})
    ExportSong.findOne({
        owner: playlistID,
        song: songID
    }, function(err, es) {
        if (err) return handleError(err)
        console.log(es)
        es.translations.push(translationID)
        es.save(function(err) {
            if (err) {
                res.status(400).send('error ' + err)
            } else {
                res.send({
                    msg: 'saving done'
                })
            }
        })
    })
})

router.delete('/playlist/:playlist_name/export1', function(req, res) {
    var playlistID = req.body.playlistID
    var songID = req.body.songID
    var translationID = req.body.translationID
    console.log(req.body)
    ExportSong.findOne({
            owner: playlistID,
            song: songID
        }, function(err, es) {
            if (err) return handleError(err)
            var index = es.translations.indexOf(translationID)
            if (index > -1) {
                es.translations.splice(index, 1)
            }
            es.save(function(err) {
                if (err) {
                    res.status(400).send('error ' + err)
                } else {
                    res.send({
                        msg: 'deleting done'
                    })
                }
            })
        })
        // ExportSong.update({_id: playlistID}, {
        //     $pull: {
        //         translations: translationID
        //     }
        // }, {
        //     multi: true
        // }, function(err) {
        //     if (err) return handleError(err)
        //     res.send({
        //         msg: 'deleting done'
        //     })
        // })
})


//this route is for step 2 of exporting playlist
router.get('/playlist/:playlist_name/export2', function(req, res) {
    res.render('export2', {
        playlistName: req.params.playlist_name
    })
})

router.get('/playlist/:playlist_name/export3', function(req, res) {
    var playlistName = req.params.playlist_name
    var songss = []
    var temp = []
    Playlist.findOne({
        owner: req.user._id,
        name: playlistName
    }, function(err, playlist) {
        if (err) return handleError(err)
        ExportSong.find({
                owner: playlist._id
            })
            .populate('song translations')
            .exec(function(err, songs) {
                // console.log(songs)
                if (err) return handleError(err)
                songs.forEach((s, i, arr) => {
                    temp = []
                    temp.push(s.song)
                    s.translations.forEach((t) => {
                            temp.push(t)
                        })
                        // console.log(temp)
                    songss.push(temp)
                    if (i === arr.length - 1) {
                        console.log(songss)
                        res.render('export3', {
                            songss: songss
                        })
                    }
                })
            })
    })

})

router.post('/playlist/:playlist_name/export3', function(req, res) {
    var playlistName = req.params.playlist_name
    var songss = []
    var temp = []
    var filename = Date.now()
    Playlist.findOne({
        owner: req.user._id,
        name: playlistName
    }, function(err, playlist) {
        if (err) return handleError(err)
        ExportSong.find({
                owner: playlist._id
            })
            .populate('song translations')
            .exec(function(err, songs) {
                // console.log(songs)
                if (err) return handleError(err)
                songs.forEach((s, i, arr) => {
                    temp = []
                    temp.push(s.song)
                    s.translations.forEach((t, i) => {
                        temp.push(t)
                    })
                    s.translations = []
                    s.save()
                    songss.push(temp)
                    if (i === arr.length - 1) {
                        console.log(songss)
                        app.render('handout', {
                            songss: songss
                        }, function(err, html) {
                            console.log(html)
                            pdf.create(html).toStream(function(err, stream) {
                                res.setHeader('Content-Type', 'application/pdf')
                                res.setHeader('Content-Disposition', 'attachment; filename=' + filename + '.pdf')
                                stream.pipe(res)
                            })
                        });
                    }
                })
            })
    })
})

router.get('/logout', isLoggedIn, function(req, res, next) {
    helperFunc.adminLogout()
        // console.log(helperFunc.isAdmin())
    req.logout();
    res.redirect('/')
})

router.use('/', notLoggedIn, function(req, res, next) {
    next()
})

router.get('/signup', function(req, res, next) {
    res.render('signup', {})
});

router.post('/signup', function(req, res, next) {
    //Validation Checks
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        //if there are errors in input
        res.render('signup', {
            errors: errors
        })
    } else {
        User.findOne({
            username: req.body.username
        }, function(err, userbyusername) {
            User.findOne({
                email: req.body.email
            }, function(err, userbyemail) {
                if (err) {
                    //if there is error
                    res.status(400).send('error adding new user ' + err)
                } else if (userbyusername) {
                    //console.log('user exists')
                    //if the user exists, display the msg
                    res.render('signup', {
                        errors: [{
                            msg: 'Username is already used'
                        }]
                    })
                } else if (userbyemail) {
                    res.render('signup', {
                        errors: [{
                            msg: 'Email is already used'
                        }]
                    })
                } else {
                    User.findOne()
                        //if the user doesnt exist, create it
                    var newUser = new User();
                    newUser.username = req.body.username;
                    newUser.email = req.body.email;
                    newUser.password = newUser.generateHash(req.body.password);
                    newUser.save(function(err, user, count) {
                        if (err) {
                            res.status(400).send('error adding new user ' + err)
                        } else {
                            res.redirect('/')
                        }
                    })
                }
            })
        })
    }
})

router.get('/login', function(req, res, next) {
    var messages = req.flash('error')
    res.render('login', {
        messages: messages,
        hasErrors: messages.length > 0
    })
})

router.post('/login', passport.authenticate('local.login', {
    successRedirect: '/',
    failureRedirect: '/user/login',
    failureFlash: true //turn the flag to true to enable flash message
}))


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/')
    }
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/user/signup')
    }
}
