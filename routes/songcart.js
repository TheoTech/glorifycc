var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var app = require('../app')
var pdf = require('html-pdf')
var fs = require('file-system')
var UserSong = require('../models/userSong')

var songs_songcart

router.get('/', function(req, res) {
        // console.log('current songcart: ' + req.session.songcart)
        songs_songcart = []
        var temp
            //find all objects in Songcart collection
            console.log('1')
        UserSong.findOne({
                owner: req.user.username
            })
            .populate({
                path: 'library.oriSong library.translations'
            })
            .exec(function(err, userSong) {
              console.log('2')
                temp = userSong
                // console.log("temp inside: " + temp)
                if (err) return handleError(err)
                // console.log(userSong)
                if (!isObjEmpty(userSong)) {
                    userSong.library.forEach((lib, j, arr_j) => {
                        // console.log('testest')
                        temp = []
                        if (lib.oriSong) {
                            temp.push(lib.oriSong)
                        }
                        // console.log('hehehe')
                        lib.translations.forEach((t, i, arr_i) => {
                            temp.push(t)
                            // if (i == arr_i.length - 1) {
                            //     songs_songcart.push(temp)
                            //     console.log(JSON.stringify(songs_songcart))
                            // }
                        })
                        // console.log('temp: ' + temp)
                        songs_songcart.push(temp)
                        // if (j == arr_j.length - 1) {
                        //
                        // }
                    })
                    // res.render('songcart', {
                    //     songss: songs_songcart
                    // })
                }
            })
            console.log('3')
            // console.log("temp outside: " + temp)

    })
    //                   // console.log(JSON.stringify(us.library))
    //                 })
    //                 // console.log(userSong)
    //                 songs.forEach((song, j, arr_j) => {
    //                     var temp = []
    //                     if (song.oriSong) {
    //                       console.log('hahaha')
    //                         temp.push(song.oriSong)
    //                     }
    //                     console.log('lalala')
    //                     // console.log(temp)
    //                     song.translations.forEach((t, i, arr_i) => {
    //                     console.log('hehehe')
    //                         if (t) {
    //                             temp.push(t)
    //                         }
    //
    //                         console.log('hihihi')
    //                         if (i == arr_i.length - 1) {
    //                             songs_songcart.push(temp)
    //                                 // console.log(songs_songcart)
    //                         }
    //                     })
    //                     if (j == arr_j.length - 1) {
    //                         console.log(songs_songcart)
    //                         res.render('songcart', {songss: songs_songcart})
    //                     }
    //                 })
    //             }
    //         })
    // })

// router.get('/', function(req, res) {
//         // console.log('current songcart: ' + req.session.songcart)
//         songs_songcart = []
//             //find all objects in Songcart collection
//         Songcart.find(function(err, songs) {
//             if (err) {
//                 res.status(400).send('error getting songcart ' + err)
//             }
//             // console.log(songs)
//             //for every object
//             var songs_songcart_idx = 0
//             songs.forEach((song) => {
//                 Song.findOne({
//                     _id: song._id,
//                     source: {$eq: null}
//                 }, function(err, oriSong) {
//                     var temp = []
//                     if (oriSong) {
//                         // console.log(oriSong.title)
//                         temp.push(oriSong)
//                             // console.log(temp)
//                             // console.log(songs_songcart[0][0])
//                             // console.log('index ' + i + ' of songcar: ' + songs_songcart[i])
//                     }
//                     songs_songcart.push(temp)
//                     Songcart.find({source: oriSong._id}, function(err, translations_songcart){
//                       if (translations_songcart){
//                         var translations_id = translations_songcart.map((t) => t._id)
//                       }
//                       Song.find({_id: translations._id}, function(err, translations_song){
//                         translations_song.forEach((t, i, arr) => {
//                           songs_songcart[i].push(t)
//                         })
//                       })
//                     })
//                     Song.findOne({
//                         _id: song._id,
//                         source: oriSong._id
//                     }, function(err, translations) {
//                         if (translations) {
//                             // console.log(translations)
//                             translations.forEach((t, i, arr) => {
//                                     // console.log('index ' + i + ': ' + songs_songcart[i])
//                                     songs_songcart[i].push(t)
//
//                                     if (i === arr.length - 1) {
//                                         console.log(songs_songcart)
//                                         res.render('songcart', {
//                                             songss: songs_songcart
//                                         })
//                                     }
//                                 })
//                                 // console.log(songs_songcart)
//                         }
//                         // if (i == songs.length-1){
//                         //
//                         // }
//                     })
//                 })
//             })
//         })
//     })
//   var songPointers = songs.map((song) => song.songPointer)
//   Song.find({_id: {$in: songPointers}}, function(err, songs){
//     if (err){
//       res.status(400).send('error ' + err)
//     }
//     if (songs){
//       songs_songcart.push(songs)
//       songs_songcart.map((song) => {
//         song.push()
//       })
//       songs.
//     } else {
//       res.status(400).send('error getting original songs ' + err)
//     }
//   })
//
//   //for originals oriSong
//         if (song.songPointer){
//           Song.findOne({
//             _id: song.songPointer
//           }, function(err, song){
//             song
//           })
//         }
//
//     //for translations
//
//
//   })
// })
// res.render('songcart', {
//     songss: req.session.songcart
// })
// })

router.get('/export-1', function(req, res) {
    console.log(songs_songcart)
    var first = req.query.first
    var second = req.query.second
    var third = req.query.third
    var fourth = req.query.fourth
    var fifth = req.query.fifth
    res.render('export-1', {
        songss: songs_songcart
    })
})


router.get('/export-2', function(req, res) {
    console.log(songs_songcart)
    var order = req.query.index
    if (order.constructor === Array) {
        order = order.map(function(idx) {
            return parseInt(idx)
        })
        var temp = []
        for (var j = 0; j < order.length; j++) {
            temp.push(songs_songcart[j])
        }
        for (var i = 0; i < order.length; i++) {
            songs_songcart[i] = temp[order[i]]
                // console.log(temp[order[i]])
        }
    }
    // console.log(req.session.songcart)
    res.render('export-2', {
        songss: songs_songcart
    })
})

router.get('/export-3', function(req, res) {
    res.render('export-3', {
        songss: songs_songcart
    })
})

router.post('/export-3', function(req, res) {
    var songss = songs_songcart
    var filename = Date.now()
        // songss.forEach((songs) => {
        //     songs.forEach((song) => {
        //         song.lyric = song.lyric.replace(/(?:\r\n|\r|\n|\/)/g, '<br>')
        //     })
        // })
    app.render('handout', {
        songss: songss
    }, function(err, html) {
        pdf.create(html).toStream(function(err, stream) {
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'attachment; filename=' + filename + '.pdf')
            stream.pipe(res)
                // stream.pipe(fs.createWriteStream(filename))
                // stream.on('end', () => {
                //   res.download(filename)
                // })
        })
    });
});

router.get('/export-3/handout', function(req, res) {
    res.render('handout', {
        songss: songs_songcart
    })
})

// router.route('/:song_id')
//       .all(function(req, res) {
//           song_id = req.params.song_id
//           songss = req.session.songcart
//       })
//       .delete(function(req, res){
//         console.log(song_id)
//         // var songss = req.session.songcart
//         var songss = (songss.map((songs) => {
//             return songs.filter((song) => {
//               return song._id != song_id})
//         }))
//         // req.session.songcart = [];
//         // req.session.songcart.splice(0, songss)
//         console.log(songss)
//         res.send('updated songcart')
//         // console.log(songss)
//         // songss = songss.filter(function(obj) {
//         //   return obj._id !== song_id
//         // })
//       })

router.delete('/:song_id', function(req, res) {
        var song_id = req.params.song_id
        UserSong.findOne({owner: req.user.username}, function(err, userSong){
          if (err) return handleError(err)
          Song.findOne({_id: song_id, source: {$eq: null}}, function(err, song){
            if (err) return handleError(err)
            if (song){
              UserSong.findOne({library: {oriSong: song_id}}, function(err, us){
                if (err) return handleError(err)
                if (us){
                  retu
                }
              })
            }
          })
          if (!isObjEmpty(userSong)){
            // UserSong.findOne({library: {oriSong: }})forEach(())
          }
        })
            // var length = req.session.songcart.length
            // songss = req.session.songcart
        console.log('yang diapus: ' + song_id)
            // var songss = req.session.songcart
        Songcart.find()
        req.session.songcart.forEach((songs, i) => {
                req.session.songcart.splice(i, 1, songs.filter((song) => {
                    return song._id != song_id
                }))
                if (req.session.songcart[i] == 0) {
                    req.session.songcart.splice(i, 1)
                }
                // console.log(songss)
                console.log(req.session.songcart)
                    // var temp = songs.filter((song) => {
                    //     return song._id != song_id
                    // })
                    // if(temp[0]){
                    //   songss.splice(i, 1)
                    // }

            })
            // req.session.songcart = [];
            // req.session.songcart.splice(0, songss)
            // console.log(songss)
        res.send('updated songcart')
    })
    // .all(function(req, res) {
    //
    // })
    // .delete(function(req, res) {

// console.log(songss)
// songss = songss.filter(function(obj) {
//   return obj._id !== song_id
// }
// router.get('/file', function(req, res) {
//     app.render('songs-in-pdf', function(err, html) {
//       pdf.create(html).toStream(function(err, stream){
//           stream.pipe(fs.createWriteStream('./foo.pdf'));
//         });
//         res.download('./foo.pdf')
//       });
// pdf.create(html).toBuffer(function(err, buffer){
//     console.log('This is a buffer:', Buffer.isBuffer(buffer));
//     res.download(buffer);
// });

// router.post('/export-3', function(req, res) {
//     app.render('export-3', function(err, html) {
//         //   console.log(html)
//         //   pdf.create(html).toFile([filepath, ]function(err, res){
//         //   console.log(res.filename);
//         // });
//         console.log(html)
//         pdf.create(html).toStream(function(err, stream) {
//             stream.pipe(fs.createWriteStream('./foo.pdf'));
//         });
//     })
//     res.redirect('/export-3');
// })

module.exports = router
