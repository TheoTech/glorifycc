var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Playlist = require('../models/playlist')
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Song = require('../models/song')
var app = require('../app')
var pdf = require('html-pdf')
var fs = require('file-system')
var officegen = require('officegen');
var async = require('async')
var _ = require('lodash')
var zip = require('express-zip')
var archiver = require('archiver')
var passportFunction = require('../lib/passport')

router.use('/', passportFunction.loggedIn)

router.get('/', function(req, res, next) {
    console.log('hahahhahahahahhaha')
    Playlist.find({
        owner: req.user._id,
        song: {
            $exists: false
        }
    }, function(err, playlists) {
        if (err) return next(err)
        console.log('hehehehehhehehehehe')
        res.render('playlist', {
            playlists: playlists
        })
    })
})


//delete song from playlist
router.delete('/', function(req, res, next) {
    var songID = req.body.id
    var playlistName = req.body.name
    Playlist.findOne({
        owner: req.user._id,
        name: playlistName,
        song: songID
    }, function(err, playlist) {
        if (err) return next(err)
        playlist.remove()
        Playlist.find({
                owner: req.user._id,
                name: playlistName,
                song: {
                    $exists: true
                }
            })
            .populate('song')
            .exec(function(err, playlists) {
                res.send({
                    songs: playlists.map((pl) => pl.song)
                })
            })
    })
})


//delete playlist
router.put('/', function(req, res, next) {
    var playlistName = req.body.name
    var redirect = req.body.redirect
    console.log(playlistName)
    Playlist.remove({
        owner: req.user._id,
        name: playlistName
    }, function(err) {
        if (err) return next(err)
        if (redirect) {
            res.send({
                url: '/user/playlist'
            })
        } else {
            res.send({})
        }
    })
})

router.get('/:playlist_name', function(req, res, next) {
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
            if (err) return next(err)
            var task = playlists.map((playlist, i, arr) => {
                return function(done) {
                    Song.find({
                            $or: [{
                                $and: [{
                                    source: playlist.song.source
                                }, {
                                    source: {
                                        $exists: true
                                    }
                                }, {
                                    lang: {
                                        $ne: playlist.song.lang
                                    }
                                }]
                            }, {
                                _id: playlist.song.source
                            }, {
                                source: playlist.song._id
                            }, {
                                _id: playlist.song._id
                            }]
                        }, function(err, translations) {
                            playlist.availableTranslations = translations.map((t) => t._id)
                            playlist.save(function(err) {
                                if (err) {
                                    res.status(400).send('failed ' + err)
                                } else if (i === arr.length - 1) {
                                    done(null)
                                } else {
                                    done()
                                }
                            })
                        })
                        .sort({
                            lang: 1
                        })
                }
            });
            async.waterfall(task, function(err) {
                res.render('playlistClicked', {
                    //pass the array of songs in the playlist
                    songs: playlists.map((pl) => pl.song),
                    playlistName: playlistName
                })
            });

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
            if (err) return next(err)
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
            res.render('export/selectTranslation', {
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
        if (err) return next
        res.send({
            url: '/user/playlist/' + playlistName + '/export3'
        })
    })
})

//this route is for step 2 of exporting playlist
router.get('/:playlist_name/export2', function(req, res, next) {
    res.render('export2', {
        playlistName: req.params.playlist_name
    })
})

router.route('/:playlist_name/export3')
    .all(function(req, res, next) {
        playlistName = req.params.playlist_name
        languagePerSlide = req.query.language;
        songs2d = [];
        maxNumberOfSongs = 0;
        Playlist.find({
                owner: req.user._id,
                name: playlistName,
                song: {
                    $exists: true
                },
                translationsChecked: {
                    $exists: true,
                    $ne: []
                }
            })
            .populate('translationsChecked')
            .exec(function(err, playlists) {
                if (err) return next(err)
                songs2d = playlists.map((playlist) => {
                    return playlist.translationsChecked

                })
                //this var is to check whether we should disable the export option on the ui
                maxNumberOfSongs = songs2d.reduce((prev, curr) => {
                    if (prev.length > curr.length) {
                        return prev.length
                    } else {
                        return curr.length
                    }
                })
                next()
            })
    })
    .get(function(req, res, next) {
        if (languagePerSlide == 1) {
            var newSongsArr = create2dArrayOfOneSong(songs2d)
            res.render('export/preview-ppt1', {
                songs2d: newSongsArr,
                maxNumberOfSongs: maxNumberOfSongs
            })
        } else if (languagePerSlide == 2) {
            var newSongsArr = create2dArrayOfTwoSongs(songs2d)
            res.render('export/preview-ppt2', {
                songs2d: newSongsArr,
                maxNumberOfSongs: maxNumberOfSongs
            })
        } else if (languagePerSlide == 3) {
            res.render('export/preview-ppt3', {
                songs2d: songs2d,
                maxNumberOfSongs: maxNumberOfSongs
            })
        } else {
            res.render('export/preview-pdf', {
                songs2d: songs2d,
                maxNumberOfSongs: maxNumberOfSongs
            })
        }
    })
    .post(function(req, res, next) {
        var filename;
        if (languagePerSlide == 1) {
            var newSongsArr = create2dArrayOfOneSong(songs2d)
            generateSlideByStanza(res, newSongsArr, playlistName, 1)
        } else if (languagePerSlide == 2) {
            var newSongsArr = create2dArrayOfTwoSongs(songs2d)
            generateSlideByStanza(res, newSongsArr, playlistName, 2)
        } else if (languagePerSlide == 3) {
            // var newSongsArr = create2dArrayOfTwoSongs(songs2d)
            // generateSlideByStanza(res, newSongsArr, playlistName, 2)
        } else {
            filename = Date.now()
            app.render('export/handout', {
                songs2d: songs2d
            }, function(err, html) {
                pdf.create(html).toStream(function(err, stream) {
                    res.setHeader('Content-Type', 'application/pdf')
                    res.setHeader('Content-Disposition', 'attachment; filename=' + filename + '.pdf')
                    stream.pipe(res)
                })
            });
        }
    })

module.exports = router;


//this function will generate multiple pptx files, compressed it to zip, and pipe it to client
/*
  songs2d is 2d array of songs object
  it will be [[song1, song2], [song1, song2], ..., [song1, song2]] for displaying 2 languages in one slide
  it will be [[song1], [song1], ..., [song1]] for displaying 1 language in one slide
*/
//stanzasPerSlide will determine the y positiong of the lyric on the slide
function generateSlideByStanza(res, songs2d, playlistName, stanzasPerSlide) {
    //files is an array to store the filename for each pptx file
    var files = [];
    songs2d.forEach((songs, index, arr) => {
        var pptx = officegen('pptx');
        filename = '';
        var slide;
        var pObj;
        pptx.setDocTitle('');
        slide = pptx.makeNewSlide(); //create a new slide
        slide.back = {
            type: 'solid',
            color: '000000' //background color black
        };
        var titleMargin = 175 //y position
        songs.forEach((song) => {
            filename += song.title;
            //add text with white color, and center horizontally
            pObj = slide.addText(song.title, {
                x: 'c', //x position
                y: titleMargin, //y position
                cx: '100%', //width
                cy: 50,
                font_size: 50,
                align: 'center',
                color: {
                    type: 'solid',
                    color: 'ffffff'
                }
            });
            titleMargin += 70; //add y space for the second title
            pObj = slide.addText('(' + song.lang + ')', {
                x: 'c', //x position
                y: titleMargin, //y position
                cx: '100%', //width
                cy: 20,
                font_size: 30,
                align: 'center',
                color: {
                    type: 'solid',
                    color: 'ffffff'
                }
            });
            titleMargin += 100;
        })
        for (var i = 0; i < songs[0].lyric.length; i++) {
            //make new slide for every new stanza with background color black
            slide = pptx.makeNewSlide();
            slide.back = {
                type: 'solid',
                color: '000000'
            };
            var margin = stanzasPerSlide === 1 ? 175 : 50;
            for (var x = 0; x < songs.length; x++) {
                for (var j = 0; j < songs[x].lyric[i].length; j++) {
                    //print stanza
                    pObj = slide.addText(songs[x].lyric[i][j], {
                        x: 'c', //x position
                        y: margin, //y position
                        cx: '100%', //width
                        cy: 40,
                        font_size: 40,
                        align: 'center',
                        color: {
                            type: 'solid',
                            color: 'ffffff'
                        }
                    });
                    margin += 50;
                }
                margin += 150
            }
        }
        var out = fs.createWriteStream(filename + '.pptx');
        pptx.generate(out, {
            'finalize': function(written) {
                //callback function after it finishes generating ppt
                console.log('Finish to create a PowerPoint file.\nTotal bytes created: ' + written + '\n');
                files.push(filename)
                if (index === arr.length - 1) {
                    setTimeout(() => {
                        var zip = archiver('zip')
                        files.forEach((file) => {
                            //zip it
                            zip.file(file + '.pptx')
                        })
                        zip.finalize()
                        res.writeHead(200, {
                            'Content-Type': 'application/zip',
                            'Content-disposition': 'attachment; filename=' + playlistName + '.zip'
                        });
                        //pipe it to client
                        zip.pipe(res)
                    }, 1000);
                }
            },
            'error': function(err) {
                console.log(err);
            }
        });
    })
}



// function generateSlideByLine(res, songs2d, playlistName) {
//     //files is an array to store the filename for each pptx file
//     var files = [];
//     songs2d.forEach((songs, index, arr) => {
//         var pptx = officegen('pptx');
//         filename = '';
//         var slide;
//         var pObj;
//         pptx.setDocTitle('');
//         slide = pptx.makeNewSlide(); //create a new slide
//         slide.back = {
//             type: 'solid',
//             color: '000000' //background color black
//         };
//         var titleMargin = 175 //y position
//         songs.forEach((song) => {
//             filename += song.title;
//             //add text with white color, and center horizontally
//             pObj = slide.addText(song.title, {
//                 x: 'c', //x position
//                 y: titleMargin, //y position
//                 cx: '100%', //width
//                 cy: 50,
//                 font_size: 50,
//                 align: 'center',
//                 color: {
//                     type: 'solid',
//                     color: 'ffffff'
//                 }
//             });
//             titleMargin += 70; //add y space for the second title
//             pObj = slide.addText('(' + song.lang + ')', {
//                 x: 'c', //x position
//                 y: titleMargin, //y position
//                 cx: '100%', //width
//                 cy: 20,
//                 font_size: 30,
//                 align: 'center',
//                 color: {
//                     type: 'solid',
//                     color: 'ffffff'
//                 }
//             });
//             titleMargin += 100;
//         })
//         songs[]
//         songs.forEach((song) => {
//
//         })
//         for (var i = 0; i < songs[0].lyric.length; i++) {
//             //make new slide for every new stanza with background color black
//             slide = pptx.makeNewSlide();
//             slide.back = {
//                 type: 'solid',
//                 color: '000000'
//             };
//             var margin = stanzasPerSlide === 1 ? 175 : 50;
//             for (var x = 0; x < songs.length; x++) {
//                 for (var j = 0; j < songs[x].lyric[i].length; j++) {
//                     //print stanza
//                     pObj = slide.addText(songs[x].lyric[i][j], {
//                         x: 'c', //x position
//                         y: margin, //y position
//                         cx: '100%', //width
//                         cy: 40,
//                         font_size: 40,
//                         align: 'center',
//                         color: {
//                             type: 'solid',
//                             color: 'ffffff'
//                         }
//                     });
//                     margin += 50;
//                 }
//                 margin += 150
//             }
//         }
//         var out = fs.createWriteStream(filename + '.pptx');
//         pptx.generate(out, {
//             'finalize': function(written) {
//                 //callback function after it finishes generating ppt
//                 console.log('Finish to create a PowerPoint file.\nTotal bytes created: ' + written + '\n');
//                 files.push(filename)
//                 if (index === arr.length - 1) {
//                     setTimeout(() => {
//                         var zip = archiver('zip')
//                         files.forEach((file) => {
//                             //zip it
//                             zip.file(file + '.pptx')
//                         })
//                         zip.finalize()
//                         res.writeHead(200, {
//                             'Content-Type': 'application/zip',
//                             'Content-disposition': 'attachment; filename=' + playlistName + '.zip'
//                         });
//                         //pipe it to client
//                         zip.pipe(res)
//                     }, 1000);
//                 }
//             },
//             'error': function(err) {
//                 console.log(err);
//             }
//         });
//     })
// }


//this function map the original 2darray to be 2d array of exactly two songs
//takes the original 2darray and return the new mapped 2darray
function create2dArrayOfTwoSongs(songs2d) {
    var newSongsArr = []
    var temp;
    songs2d.forEach((songs) => {
        temp = []
        songs.forEach((song, i, arr) => {
            temp.push(song);
            if (i === arr.length - 1) {
                newSongsArr.push(temp)
            } else if ((i + 1) % 2 === 0) {
                newSongsArr.push(temp)
                temp = [];
            }
        })
    })
    return newSongsArr
}

//this function map the original 2darray to be 2d array of exactly one song
//takes the original 2darray and return the new mapped 2darray
function create2dArrayOfOneSong(songs2d) {
    var temp;
    return songs2d.map((songs) => {
        return songs.map((song) => [song])
    }).reduce((prev, curr) => {
        return prev.concat(curr)
    })
}

// function generateSlidesByLine(){
//   filename = Date.now()
//   var pptx = officegen('pptx');
//
//   var slide;
//   var pObj;
//
//   pptx.on('finalize', function(written) {
//       console.log('Finish to create a PowerPoint file.\nTotal bytes created: ' + written + '\n');
//   });
//
//   pptx.on('error', function(err) {
//       console.log(err);
//   });
//
//   pptx.setDocTitle('');
//
//   function generateSlides(callback) {
//       songs2d.forEach((songObj) => {
//           slide = pptx.makeNewSlide();
//           slide.back = {
//               type: 'solid',
//               color: '000000'
//           };
//           for (var i = 0; i < songObj.minLine; i++) {
//               //make new slide for every lyric line
//               slide = pptx.makeNewSlide();
//               slide.back = {
//                   type: 'solid',
//                   color: '000000'
//               };
//               for (var j = 0; j < songObj.songs.length; j++) {
//                   //print the lyric line for each translation
//                   pObj = slide.addText(songObj.songs[j].lyric[i], {
//                       x: 'c', //x position
//                       y: 250 + j * 100, //y position
//                       cx: '100%', //width
//                       cy: 50, //height
//                       font_size: 40,
//                       align: 'center',
//                       color: {
//                           type: 'solid',
//                           color: 'ffffff'
//                       }
//                   });
//               }
//           }
//       })
//       callback();
//   }
//
//
//   function finalize() {
//       var out = fs.createWriteStream(filename + '.pptx');
//       out.on('error', function(err) {
//           console.log(err);
//       });
//       res.writeHead(200, {
//           "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//           'Content-disposition': 'attachment; filename=' + filename + '.pptx'
//       });
//       pptx.generate(res);
//   }
//
//   async.series([generateSlides], finalize);
//
// }
