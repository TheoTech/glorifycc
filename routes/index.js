var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var User = require('../models/user');
var _ = require('lodash');
var Playlist = require('../models/playlist');
var async = require('async');
var Language = require('../models/language');
var copyrightTypes = require('../lib/copyrightTypes');


router.get('/', function(req, res, next) {
    var messages = req.flash();
    var langsExist;
    Song.find({
            copyright: {
                $ne: copyrightTypes.private
            }
        }, function(err, songs) {
            if (err) {
                res.status(400).send('error getting song list ' + err);
            }
            //to get the what languages we need to include in the dropdown for filtering feature
            langsExist = _.uniq(songs.map((s) => s.lang));
            if (req.isAuthenticated()) {
                User.findOne({
                    _id: req.user._id
                }, function(err, user) {
                    if (err) next(err);
                    Playlist.find({
                        owner: req.user._id,
                        song: {
                            $exists: false
                        }
                    }, function(err, playlists) {
                        if (err) next(err);
                        res.render('index', {
                            songs: songs,
                            inLibrary: user.library,
                            playlists: playlists,
                            messages: messages,
                            langsExist: langsExist,
                            isLoggedIn: true
                        });
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
                });
            }
        })
        .sort({
            title: 1
        })
        .limit(10)
})



router.post('/', function(req, res, next) {
    var id = req.body.id;
    User.findOne({
        _id: req.user._id
    }, function(err, user) {
        if (err) next(err);
        user.library.push(id);
        user.save(function(err) {
            if (err) next(err);
            res.send({
                inLibrary: user.library
            });
        });
    })
})

router.delete('/', function(req, res, next) {
    var id = req.body.id;
    User.findOne({
        _id: req.user._id
    }, function(err, user) {
        if (err) next(err)
        var index = user.library.indexOf(id);
        if (index > -1) {
            user.library.splice(index, 1);
        }
        user.save(function(err) {
            if (err) next(err);
            res.send({
                inLibrary: user.library
            });
        });
    });
})

router.get('/search', function(req, res, next) {
    var searchString = req.query.q;

    function findSongsLoggedIn(done) {
        var query = new RegExp('.*' + searchString + '.*');
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
                            lyrics: {
                                $regex: query,
                                $options: 'si'
                            }
                        }]
                    }, {
                        $or: [{
                            copyright: copyrightTypes.private,
                            contributor: req.user.username
                        }, {
                            copyright: {
                                $ne: copyrightTypes.private
                            }
                        }]
                    }]
                },
                function(err, songs) {
                    done(null, songs)
                })
            .sort({
                title: 1
            });
    }

    function findSongsNotLoggedIn(done) {
        var query = new RegExp('.*' + searchString + '.*');
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
                        lyrics: {
                            $regex: query,
                            $options: 'si'
                        }
                    }],
                    copyright: {
                        $ne: copyrightTypes.private
                    }
                },
                function(err, songs) {
                    done(null, songs)
                })
            .sort({
                title: 1
            });
    }

    function findInLibraryAndPlaylist(songs, done) {
        User.findById(req.user._id, function(err, user) {
            if (err) next(err);
            Playlist.find({
                owner: req.user._id,
                song: {
                    $exists: false
                }
            }, function(err, playlists) {
                if (err) next(err);
                done(null, songs, user.library, playlists);
            });
        });
    }

    function finalize(err, songs, inLibrary, playlists) {
        if (err) {
            res.status(500).send('Internal error' + err);
        } else {
            res.render('search', {
                songs: songs,
                inLibrary: inLibrary || [],
                playlists: playlists || []
            });
        }
    }

    if (searchString) {
        if (req.isAuthenticated()) {
            async.waterfall([findSongsLoggedIn, findInLibraryAndPlaylist], finalize);
        } else {
            //if the user not logged in then we dont need to findInLibraryAndPlaylist and just pass empty array
            //for inLibrary and playlists at the render
            async.waterfall([findSongsNotLoggedIn], finalize);
        }
    } else {
        res.render('search', {
            songs: [],
            inLibrary: [],
            playlists: []
        });
    }
})

module.exports = router;
