var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Playlist = require('../models/playlist')
var mongoose = require('mongoose');
var nev = require('email-verification')(mongoose);
var bcrypt = require('bcrypt-nodejs');
var config = require('config')
var ExportSong = require('../models/exportSong')
var Song = require('../models/song')
var _ = require('lodash')

router.get('/', function(req, res, next) {
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

router.post('/', function(req, res, next) {
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

router.delete('/', function(req, res) {
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

router.put('/', function(req, res) {
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
router.get('/:playlist_name/export1', function(req, res, next) {
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
                            console.log(translationss)
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


router.post('/:playlist_name/export1', function(req, res, next) {
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

router.delete('/:playlist_name/export1', function(req, res) {
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
router.get('/:playlist_name/export2', function(req, res) {
    res.render('export2', {
        playlistName: req.params.playlist_name
    })
})

router.get('/:playlist_name/export3', function(req, res) {
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
                            songss: songss,
                            minLine: _.min(songss.map((songs) => songs.map((s) => s.lyric.length)))
                        })
                    }
                })
            })
    })

})

router.post('/:playlist_name/export3', function(req, res) {
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
                            songss: songss,
                            minLine: _.min(songss.map((songs) => songs.map((s) => s.lyric.length)))
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


module.exports = router;
