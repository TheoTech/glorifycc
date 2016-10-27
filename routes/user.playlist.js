var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Playlist = require('../models/playlist')
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Song = require('../models/song')
var _ = require('lodash')
var app = require('../app')
var pdf = require('html-pdf')
var fs = require('file-system')
var officegen = require('officegen');
var async = require('async')


router.get('/', function(req, res, next) {
    Playlist.find({
        owner: req.user._id,
        song: {
            $exists: false
        }
    }, function(err, playlists) {
        if (err) return handleError(err)
        res.render('playlist', {
            playlists: playlists
        })
    })
})


// router.post('/', function(req, res, next) {
//     var name = req.body.name
//     Playlist.findOne({
//             owner: req.user._id,
//             name: name
//         })
//         .populate('songs')
//         .exec(function(err, playlist) {
//             if (err) return handleError(err)
//             res.send({
//                 songs: playlist.songs,
//                 name: playlist.name
//             })
//         })
// })


//delete song from playlist
router.delete('/', function(req, res) {
    var songID = req.body.id
    var playlistName = req.body.name
    Playlist.remove({
        owner: req.user._id,
        name: playlistName,
        song: songID
    }, function(err) {
        if (err) return handleError(err)
        Playlist.find({
            owner: req.user._id,
            name: playlistName,
            song: {
                $exists: true
            }
        }, function(err, playlists) {
            res.send({
                songs: playlists.map((pl) => pl.song)
            })
        })

    })
})


//delete playlist
router.put('/', function(req, res) {
    var playlistName = req.body.name
    var redirect = req.body.redirect
    console.log(playlistName)
    Playlist.remove({
        owner: req.user._id,
        name: playlistName
    }, function(err) {
        if (err) return handleError(err)
        if (redirect) {
            res.send({
                url: '/user/playlist'
            })
        } else {
            res.send({})
        }
    })
})

router.get('/:playlist_name', function(req, res) {
    var playlistName = req.params.playlist_name
    Playlist.find({
            owner: req.user._id,
            name: playlistName,
            song: {
                $exists: true
            }
        })
        .populate('song')
        .exec(function(err, playlists) {
            if (err) return handleError(err)
            res.render('playlistClicked', {
                //pass the array of songs in the playlist
                songs: playlists.map((pl) => pl.song),
                playlistName: playlistName
            })
        })
})


//this route is for step one of exporting playlist
router.get('/:playlist_name/export1', function(req, res, next) {
    var playlistName = req.params.playlist_name
    var uniqueLanguages; //this is for the labels on the table for picking translations
    var songs; //Content: {song: Song, availableTranslations: [Song]}
    Playlist.find({
            owner: req.user._id,
            name: playlistName,
            song: {
                $exists: true
            }
        })
        .populate('song availableTranslations')
        .exec(function(err, playlists) {
            if (err) return handleError(err)
            uniqueLanguages =
                //get 2d array of songs' languages, turn it to 1d array, get the unique languages, sort it by alphabet
                (_.uniq(playlists.map((pl) =>
                        pl.availableTranslations.map((translation) =>
                            translation.lang))
                    .reduce((prev, curr) => _.concat(prev, curr)))).sort();

            songs =
                //get the songs object useful for client side
                playlists.map((playlist) => {
                    console.log(playlist.translationsChecked)
                    return {
                        song: playlist.song,
                        availableTranslations: playlist.availableTranslations.map((availableTranslation) => {
                            return {
                                _id: availableTranslation._id,
                                lang: availableTranslation.lang
                            }
                        }),
                        translationsChecked: playlist.translationsChecked
                    }
                })
            res.render('export1', {
                uniqueLanguages: uniqueLanguages,
                songs: songs,
                playlistName: playlistName
            })
        })
})


//adding translationsChecked to Playlist
router.post('/:playlist_name/export1', function(req, res, next) {
    var playlistName = req.params.playlist_name
    var songs = req.body
    async.waterfall(songs.map((song, i, arr) => {
        return function(done) {
            Playlist.findOne({
                owner: req.user._id,
                name: playlistName,
                song: song.song
            }, function(err, playlist) {
                playlist.translationsChecked = song.translationsChecked;
                playlist.save()
                done()
            })
        }
    }), function(err) {
        if (err) return handleError
        res.send({
            url: '/user/playlist/' + playlistName + '/export3'
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
        songs2d = {};
        Playlist.find({
                owner: req.user._id,
                name: playlistName,
                song: {
                    $exists: true
                }
            })
            .populate('translationsChecked')
            .exec(function(err, playlists) {
                if (err) return handleError(err)
                songs2d = playlists.map((playlist) => {
                    return {
                        songs: playlist.translationsChecked,
                        minLine: _.min(playlist.translationsChecked.map((t) => t.lyric.length))
                    }
                })
                console.log('test: ' + songs2d)
                next()
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
            var pptx = officegen('pptx');

            var slide;
            var pObj;

            pptx.on('finalize', function(written) {
                console.log('Finish to create a PowerPoint file.\nTotal bytes created: ' + written + '\n');
            });

            pptx.on('error', function(err) {
                console.log(err);
            });

            pptx.setDocTitle('');

            function generateSlides(callback) {
                songs2d.forEach((songObj) => {
                    slide = pptx.makeNewSlide();
                    slide.back = {
                        type: 'solid',
                        color: '000000'
                    };
                    for (var i = 0; i < songObj.minLine; i++) {
                        //make new slide for every lyric line
                        slide = pptx.makeNewSlide();
                        slide.back = {
                            type: 'solid',
                            color: '000000'
                        };
                        for (var j = 0; j < songObj.songs.length; j++) {
                            //print the lyric line for each translation
                            pObj = slide.addText(songObj.songs[j].lyric[i], {
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
                res.writeHead(200, {
                    "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    'Content-disposition': 'attachment; filename=' + filename + '.pptx'
                });
                pptx.generate(res);
            }

            async.series([generateSlides], finalize);

        } else {
            console.log(songs2d)
            res.render('export3', {
                songs2d: songs2d
            })
        }
    })

module.exports = router;
