var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Playlist = require('../models/playlist')
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var ExportSong = require('../models/exportSong')
var Song = require('../models/song')
var _ = require('lodash')
var app = require('../app')
var pdf = require('html-pdf')
var fs = require('file-system')
var officegen = require('officegen');
var async = require('async')


router.get('/', function(req, res, next) {
    Playlist.find({
        owner: req.user._id
    }, function(err, playlists) {
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
            if (err) return handleError(err)
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

router.get('/:playlist_name', function(req, res) {
    var playlistName = req.params.playlist_name
    Playlist.findOne({
            owner: req.user._id,
            name: playlistName
        })
        .populate('songs')
        .exec(function(err, playlist) {
            if (err) return handleError(err)
            res.render('playlistClicked', {
                playlist: playlist
            })
        })
})


//this route is for step one of exporting playlist
router.get('/:playlist_name/export1', function(req, res, next) {
    var playlistName = req.params.playlist_name
    var translations2d = []
    var currentExportSongCollection = []
    Playlist.findOne({
            owner: req.user._id,
            name: playlistName
        })
        .populate('songs')
        .exec(function(err, playlist) {
            if (err) return handleError(err)
                // console.log(playlist.songs)
            if (!_.isEmpty(playlist.songs)) {
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
                                currentExportSongCollection.push(_.pick(es, ['song', 'translations']))
                            }
                        })
                        // console.log(s._id)
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
                            translations2d.push(songs.map((s) => s))
                            if (i == arr.length - 1) {
                                res.render('export1', {
                                    playlistID: playlist._id,
                                    playlistName: playlist.name,
                                    songs: playlist.songs,
                                    translations2d: translations2d,
                                    currentExportSongCollection: currentExportSongCollection
                                })
                            }
                        })
                })
            }
        })
})


router.post('/:playlist_name/export1', function(req, res, next) {
    var exportSongCollection = req.body.obj
    var playlistID = req.body.playlistID
    exportSongCollection.forEach((o, i, arr) => {
        ExportSong.findOne({
            owner: playlistID,
            song: o.song
        }, function(err, es) {
            if (err) return handleError(err)
            es.translations = o.translations
            es.save(function(err) {
                if (err) return handleError(err)
                if (i == arr.length - 1) {
                    res.send()
                }
            })
        })
    })
})



//this route is for step 2 of exporting playlist
router.get('/:playlist_name/export2', function(req, res) {
    res.render('export2', {
        playlistName: req.params.playlist_name
    })
})

router.route('/:playlist_name/export3')
    .all(function(req, res, next) {
        playlistName = req.params.playlist_name
        songs2d = []
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
                        //this is for taking the mininum number of lines between song and translations
                        temp.push(_.min(temp.map((s) => s.lyric.length)))
                        songs2d.push(temp)
                        if (i === arr.length - 1) {
                            next()
                        }
                    })
                })
        })
    })
    .get(function(req, res) {
        var type = req.query.type;
        var filename;
        if (type === 'pdf') {
            filename = Date.now()
            app.render('handout', {
                songs2d: songs2d
            }, function(err, html) {
                console.log(html)
                pdf.create(html).toStream(function(err, stream) {
                    res.setHeader('Content-Type', 'application/pdf')
                    res.setHeader('Content-Disposition', 'attachment; filename=' + filename + '.pdf')
                    stream.pipe(res)
                })
            });
        } else if (type === 'pptx') {
            filename = Date.now()
            res.writeHead(200, {
                "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                'Content-disposition': 'attachment; filename=' + filename + '.pptx'
            });
            var pptx = officegen('pptx');

            var slide;
            var pObj;

            pptx.on('finalize', function(written) {
                console.log('Finish to create a PowerPoint file.\nTotal bytes created: ' + written + '\n');
            });

            pptx.on('error', function(err) {
                console.log(err);
            });

            pptx.setDocTitle(playlistName);
            function generateSlides(callback) {
                songs2d.forEach((s2d) => {
                    slide = pptx.makeNewSlide();
                    slide.back = {
                        type: 'solid',
                        color: '000000'
                    };
                    for (var i = 0; i < s2d[0].lyric.length; i++) {
                        //make new slide for every lyric line
                        slide = pptx.makeNewSlide();
                        slide.back = {
                            type: 'solid',
                            color: '000000'
                        };
                        for (var j = 0; j < s2d.length - 1; j++) {
                            //print the lyric line for each translation
                            pObj = slide.addText(s2d[j].lyric[i], {
                                x: 'c', //x position
                                y: 250 + j * 100, //y position
                                cx: '100%', //width
                                cy: 50, //height
                                font_size: 40,
                                align: 'center',
                                color: {
                                    type: 'solid',
                                    color: 'ffffff'
                                }
                            });
                        }
                    }
                })
                callback();
            }


            function finalize() {
                var out = fs.createWriteStream(filename + '.pptx');

                out.on('error', function(err) {
                    console.log(err);
                });
                pptx.generate(res);
            }

            async.series([generateSlides], finalize);

        } else {
            res.render('export3', {
                songs2d: songs2d
            })
        }

    })



module.exports = router;
