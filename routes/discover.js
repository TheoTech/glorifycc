var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var User = require('../models/user');
var _ = require('lodash');
var Playlist = require('../models/playlist');
var async = require('async');
var copyrightTypes = require('../lib/copyrightTypes');

router.get('/', function(req, res, next) {
    var playlistName = req.query.playlist || '';
    var messages = req.flash();
    var langsExist;
    var messages = req.flash();
    Song.find({
            copyright: {
                $ne: copyrightTypes.private
            }
        })
        .populate('lang')
        .sort({
            title: 1
        })
        .exec(function(err, songs) {
            if (err) {
                next(err);
            }
                //to get what languages we need to include in the dropdown for filtering feature
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
                        res.render('discover', {
                            songs: songs,
                            inLibrary: user.library,
                            playlists: playlists,
                            messages: messages,
                            langsExist: langsExist,
                            playlistName: playlistName
                        });
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
                });
            }
        })
});

router.put('/', function(req, res, next) {
    var langShown = req.body.langShown;
    var langFilter = req.body.langFilter;
    var searchString = req.body.searchString;
    var totalSongsDisplayed = req.body.totalSongsDisplayed;
    var songs2d = [];

    //find all parent songs
    var findOriginalSong = function(done) {
        var query = new RegExp('.*' + searchString + '.*');
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
                    done(err, songs)
                });
        } else {
            Song.find({
                    source: {
                        $exists: false
                    },
                    copyright: {
                        $ne: copyrightTypes.private
                    }
                },
                function(err, songs) {
                    done(err, songs)
                });
        }
    }

    //find all children songs for every parent song
    var findTranslations = function(songs, done) {
        if (_.isEmpty(songs)) {
            done(null, []);
        } else {
            var task = songs.map((s, i, arr) => {
                return function(done) {
                    var temp = [];
                    temp.push(s);
                    Song.find({
                        source: s._id,
                        copyright: {
                            $ne: copyrightTypes.private
                        }
                    }, (err, translations) => {
                        translations.forEach((t) => {
                            temp.push(t);
                        });
                        songs2d.push(temp);
                        if (i === arr.length - 1) {
                            done(null, songs2d);
                        } else {
                            done();
                        }
                    })
                }
            });
            async.waterfall(task, function(err, songs2d) {
                done(null, songs2d);
            });
        }
    }

    //apply 'show songs that have translations in' filter
    var applyFilter = function(songs2d, done) {
        if (!_.isEmpty(langFilter)) {
            songs2d = songs2d.filter((songs) => {
                //get all the songs lang id, convert it to string so we can compare it later with langFilter
                var langArray = (songs.map((song) => song.lang.toString()));
                for (var i = 0; i < langFilter.length; i++) {
                    if (!_.includes(langArray, langFilter[i])) {
                        return false;
                    }
                }
                return true;
            });
        }
        done(null, songs2d);
    }

    //turn 2d array to 1d array
    var concatSongs = function(songs2d, done) {
        if (!_.isEmpty(songs2d)) {
            songs2d = _.sortBy(songs2d.reduce((prev, curr) => {
                return _.concat(prev, curr);
            }), ['title']);
        }
        done(null, songs2d);
    }

    var loadMore = function(songs2d, done) {
        if (langShown !== 'all') {
            //apply 'show songs in' filter
            songs2d = songs2d.filter((s) => s.lang.toString() === langShown);
        }
        if (songs2d.length >= totalSongsDisplayed) {
            songs2d = songs2d.slice(0, totalSongsDisplayed);
        }
        done(null, songs2d);
    }

    var finalize = function(err, songs2d) {
        if (err) {
            res.status(500).send('Internal error' + err);
        } else {
            res.send({
                songs: songs2d
            });
        }
    }

    async.waterfall([findOriginalSong, findTranslations, applyFilter, concatSongs, loadMore], finalize);

});

module.exports = router;
