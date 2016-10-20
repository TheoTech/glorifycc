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
                                // console.log(t.lyric)
                        })
                        temp.push(_.min(temp.map((s) => s.lyric.length)))
                            // console.log(temp)
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

            pptx.setDocTitle('Sample PPTX Document');

            function generateSlides(callback) {
                songs2d.forEach((s2d) => {
                    slide = pptx.makeNewSlide();
                    slide.back = {
                        type: 'solid',
                        color: 'ffffff'
                    };
                    for (var i = 0; i < s2d[0].lyric.length; i++) {
                        slide = pptx.makeNewSlide();
                        slide.back = {
                            type: 'solid',
                            color: 'ffffff'
                        };
                        for (var j = 0; j < s2d.length - 1; j++) {
                            pObj = slide.addText(s2d[j].lyric[i], {
                                x: 'c',
                                y: 250 + j * 100,
                                cx: '100%',
                                cy: 50,
                                font_size: 40,
                                align: 'center',
                                color: {
                                    type: 'solid',
                                    color: '000000'
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
                // console.log('hehehe')
                pptx.generate(res);
            }

            async.series([generateSlides], finalize);

        } else {
            res.render('export3', {
                songs2d: songs2d
            })
        }

    })
    // router.put('/:playlist_name/export3', function(req, res) {
    //     var pptx = officegen('pptx');
    //
    //     var slide;
    //     var pObj;
    //
    //     pptx.on('finalize', function(written) {
    //         console.log('Finish to create a PowerPoint file.\nTotal bytes created: ' + written + '\n');
    //         // res.writeHead(200, {
    //         //     "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    //         //     'Content-disposition': 'attachment; filename=surprise.pptx'
    //         // });
    //         // clear the temporatory files
    //     });
    //
    //     pptx.on('error', function(err) {
    //         console.log(err);
    //     });
    //
    //     pptx.setDocTitle('Sample PPTX Document');
    //
    //
    //
    //     function generateExampleSlides(callback) {
    //         // do the rest things here
    //         // console.log('finalize');
    //
    //         // Let's create a new slide:
    //         slide = pptx.makeNewSlide();
    //
    //         slide.name = 'The first slide!';
    //
    //         // Change the background color:
    //         slide.back = '000000';
    //
    //         // Declare the default color to use on this slide:
    //         slide.color = 'ffffff';
    //
    //         // Basic way to add text string:
    //         slide.addText('Created using Officegen version ' + officegen.version);
    //         slide.addText('Fast position', 0, 20);
    //         slide.addText('Full line', 0, 40, '100%', 20);
    //
    //         // Add text box with multi colors and fonts:
    //         slide.addText([{
    //             text: 'Hello ',
    //             options: {
    //                 font_size: 56
    //             }
    //         }, {
    //             text: 'World!',
    //             options: {
    //                 font_size: 56,
    //                 font_face: 'Arial',
    //                 color: 'ffff00'
    //             }
    //         }], {
    //             cx: '75%',
    //             cy: 66,
    //             y: 150
    //         });
    //         // Please note that you can pass object as the text parameter to addText.
    //
    //         // For a single text just pass a text string to addText:
    //         slide.addText('Office generator', {
    //             y: 66,
    //             x: 'c',
    //             cx: '50%',
    //             cy: 60,
    //             font_size: 48,
    //             color: '0000ff'
    //         });
    //
    //         pObj = slide.addText('Boom\nBoom!!!', {
    //             y: 100,
    //             x: 10,
    //             cx: '70%',
    //             font_face: 'Wide Latin',
    //             font_size: 54,
    //             color: 'cc0000',
    //             bold: true,
    //             underline: true
    //         });
    //         pObj.options.y += 150;
    //
    //         // 2nd slide:
    //         slide = pptx.makeNewSlide();
    //
    //         // For every color property (including the back color property) you can pass object instead of the color string:
    //         slide.back = {
    //             type: 'solid',
    //             color: '004400'
    //         };
    //         pObj = slide.addText('Office generator', {
    //             y: 'c',
    //             x: 0,
    //             cx: '100%',
    //             cy: 66,
    //             font_size: 48,
    //             align: 'center',
    //             color: {
    //                 type: 'solid',
    //                 color: '008800'
    //             }
    //         });
    //         pObj.setShadowEffect('outerShadow', {
    //             bottom: true,
    //             right: true
    //         });
    //
    //         slide = pptx.makeNewSlide();
    //
    //         slide.show = false;
    //         slide.addText('Red line', 'ff0000');
    //         slide.addShape(pptx.shapes.OVAL, {
    //             fill: {
    //                 type: 'solid',
    //                 color: 'ff0000',
    //                 alpha: 50
    //             },
    //             line: 'ffff00',
    //             y: 50,
    //             x: 50
    //         });
    //         slide.addText('Red box 1', {
    //             color: 'ffffff',
    //             fill: 'ff0000',
    //             line: 'ffff00',
    //             line_size: 5,
    //             y: 100,
    //             rotate: 45
    //         });
    //         slide.addShape(pptx.shapes.LINE, {
    //             line: '0000ff',
    //             y: 150,
    //             x: 150,
    //             cy: 0,
    //             cx: 300
    //         });
    //         slide.addShape(pptx.shapes.LINE, {
    //             line: '0000ff',
    //             y: 150,
    //             x: 150,
    //             cy: 100,
    //             cx: 0
    //         });
    //         slide.addShape(pptx.shapes.LINE, {
    //             line: '0000ff',
    //             y: 249,
    //             x: 150,
    //             cy: 0,
    //             cx: 300
    //         });
    //         slide.addShape(pptx.shapes.LINE, {
    //             line: '0000ff',
    //             y: 150,
    //             x: 449,
    //             cy: 100,
    //             cx: 0
    //         });
    //         slide.addShape(pptx.shapes.LINE, {
    //             line: '000088',
    //             y: 150,
    //             x: 150,
    //             cy: 100,
    //             cx: 300
    //         });
    //         slide.addShape(pptx.shapes.LINE, {
    //             line: '000088',
    //             y: 150,
    //             x: 150,
    //             cy: 100,
    //             cx: 300
    //         });
    //         slide.addShape(pptx.shapes.LINE, {
    //             line: '000088',
    //             y: 170,
    //             x: 150,
    //             cy: 100,
    //             cx: 300,
    //             line_head: 'triangle'
    //         });
    //         slide.addShape(pptx.shapes.LINE, {
    //             line: '000088',
    //             y: 190,
    //             x: 150,
    //             cy: 100,
    //             cx: 300,
    //             line_tail: 'triangle'
    //         });
    //         slide.addShape(pptx.shapes.LINE, {
    //             line: '000088',
    //             y: 210,
    //             x: 150,
    //             cy: 100,
    //             cx: 300,
    //             line_head: 'stealth',
    //             line_tail: 'stealth'
    //         });
    //         pObj = slide.addShape(pptx.shapes.LINE);
    //         pObj.options.line = '008888';
    //         pObj.options.y = 210;
    //         pObj.options.x = 150;
    //         pObj.options.cy = 100;
    //         pObj.options.cx = 300;
    //         pObj.options.line_head = 'stealth';
    //         pObj.options.line_tail = 'stealth';
    //         pObj.options.flip_vertical = true;
    //         slide.addText('Red box 2', {
    //             color: 'ffffff',
    //             fill: 'ff0000',
    //             line: 'ffff00',
    //             y: 350,
    //             x: 200,
    //             shape: pptx.shapes.ROUNDED_RECTANGLE,
    //             indentLevel: 1
    //         });
    //
    //         slide = pptx.makeNewSlide();
    //         callback();
    //     }
    //
    //     function generateTable(callback) {
    //         slide = pptx.makeNewSlide();
    //
    //         var rows = [];
    //         var columnWidths = [];
    //         for (var i = 0; i < 12; i++) {
    //             var row = [];
    //             for (var j = 0; j < 5; j++) {
    //                 row.push("[" + i + "," + j + "]");
    //             }
    //             rows.push(row);
    //             columnWidths.push(300 * 1000 + Math.round(Math.random() * 800 * 1000));
    //         }
    //
    //         slide.addTable(rows, {
    //             font_size: 9,
    //             font_face: "Comic Sans MS",
    //             columnWidths: columnWidths
    //         });
    //         callback();
    //     }
    //
    //     function finalize() {
    //         var out = fs.createWriteStream('out.pptx');
    //
    //         out.on('error', function(err) {
    //             console.log(err);
    //         });
    //
    //         pptx.generate(out);
    //     }
    //
    //     async.series([
    //         generateTable,
    //         generateExampleSlides // inherited from original project
    //     ], finalize);

// })




module.exports = router;
