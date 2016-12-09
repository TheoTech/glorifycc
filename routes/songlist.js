var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var User = require('../models/user');
var _ = require('lodash');
var Playlist = require('../models/playlist');
var fs = require('file-system');
var officegen = require('officegen');
var async = require('async');

router.get('/songlist', function(req, res, next) {
    var messages = req.flash();
    var langsExist;
    var messages = req.flash();
    Song.find({
            copyright: {
                $ne: 'private'
            }
        }, function(err, songs, count) {
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
                        res.render('songlist', {
                            songs: songs,
                            inLibrary: user.library,
                            playlists: playlists,
                            messages: messages,
                            langsExist: langsExist,
                            isLoggedIn: true
                        });
                    });
                });
            } else {
                res.render('songlist', {
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
        .limit(10);
});

module.exports = router;
