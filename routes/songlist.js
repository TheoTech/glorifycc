var express = require('express'),
    router = express.Router(),
    Song = require('../models/song')


router.get('/', function(req, res) {
    langDisplayed = req.query.lang || ['english', 'mandarin', 'spanish', 'portuguese']
    Song.find({
            lang: {
                $in: langDisplayed
            }
        }, function(err, songs, count) {
            if (err) {
                res.status(400).send('error getting song list ' + err)
            }
            res.render('songlist', {
                songs: songs,
            })
        })
        .sort({
            timeAdded: -1
        })
})


// router.get('/', function(req, res) {
//     Song.find({
//         source: null
//     }, function(err, songs, count) {
//         if (err) {
//             res.status(400).send('error getting song list ' + err)
//         } else {
//             Song.find({
//                 source: {
//                     $ne: null
//                 }
//             }, function(err, translations) {
//                 if (err) {
//                     res.status(400).send('error getting song translations ' + err)
//                 }
//                 songs = songs || [{}]
//                 translations = translations || [{}]
//                 // console.log(songs)
//                 console.log(translations)
//                 res.render('songlist', {
//                     songs: songs,
//                     translations: translations
//                 })
//             })
//         }
//     })
// })

// router.put('/', function(req, res) {
//     Song.find(function(err, songs, count) {
//         if (err) {
//             res.status(400).send('error getting song list ' + err)
//         } else {
//             console.log(songs)
//             res.json(songs);
//         }
//     })
// })



router.route('/:song_id')
    .all(function(req, res, next) {
        lang = req.query.lang || ''
        v = req.query.v || ''
        song_id = req.params.song_id
        song = {}
        Song.findById(song_id, function(err, s) {
            song = s;
            next()
        })
    })
    .get(function(req, res) {
        // console.log(song_id)
        // console.log('version: ' + v)
        Song.find({
            source: song.id
        }, function(err, translations) {
            // console.log(t)
            if (err) {
                res.status(400).send('Error getting songs ' + err)
            }
            if (!translations[0]) {
                console.log('user picks translation song')
                console.log(song)
                Song.find({
                    _id: song.source
                }, function(err, parentSong) {
                    // console.log(parentSong)
                    var parentId
                    parentSong.forEach(function(ps) {
                            translations.push(ps)
                            parentId = ps._id
                        })
                        // console.log(t)
                    console.log(song.source)
                    console.log(parentId)
                    Song.find({
                        source: parentId
                    }, function(err, theRestT) {
                        console.log(theRestT)
                        theRestT.forEach(function(trt) {
                            if (trt.id !== song_id) {
                                translations.push(trt)
                            }
                        })
                        // console.log(translations)
                        var rightTranslation = translations.find((translation) => translation.lang === lang) || {}
                        var isTranslationExisted = !isEmpty(rightTranslation)
                        // console.log(rightTranslation)
                        res.render('song', {
                            song: song,
                            // langAndVers: langAndVers,
                            rightTranslation: rightTranslation,
                            isTranslationExisted: isTranslationExisted,
                            translations: translations
                        })
                    })
                })
            } else {
                console.log('user picks ori song')
                var rightTranslation = translations.find((translation) => translation.lang === lang) || {}
                var isTranslationExisted = !isEmpty(rightTranslation)
                console.log(rightTranslation)
                res.render('song', {
                    song: song,
                    // langAndVers: langAndVers,
                    rightTranslation: rightTranslation,
                    isTranslationExisted: isTranslationExisted,
                    translations: translations
                })
            }
            // console.log(translations)

        })
    })

// console.log(translations)

// console.log('hahahha')
//   } else {
//
//   }
//   console.log(translations)
//   // var langAndVers = getLangAndVer(t) || {}
//   var rightTranslation = translations.find((translation) => translation.lang === lang && translation.v == v) || {}
//   var isTranslationExisted = !(Object.keys(rightTranslation).length === 0 && rightTranslation.constructor === Object);
// //   if (t){
// //   Song.find({_id: song.source}, function(err, parentSong){
// //     rightTranslation.push(parentSong)
// //   })
// // }
//   // song.lyric = song.lyric.replace(/(?:\r\n|\r|\n|\/)/g, '<br>')
//   // if (isTranslationExisted) {
//   //     //if there is the rightTranslation
//   //     // console.log(rightTranslation)
//   //     rightTranslation.lyric = rightTranslation.lyric.replace(/(?:\r\n|\r|\n|\/)/g, '<br>')
//   // }
//   // console.log(translations)


.post(function(req, res) {
        var songsPicked = req.body.song
        var songcart = req.session.songcart ? req.session.songcart : [];

        Song.find({
            _id: {
                $in: songsPicked
            }
        }, function(err, songs) {
            if (err) {
                res.status(400).send('error adding songs to the songcart ' + error)
            }
            // console.log(songs)
            // songs.forEach((song) => songcart.push(song))
            songcart.push(songs)
            req.session.songcart = songcart
                // req.session.songcart.push(songs)
            console.log(req.session.songcart)
            res.redirect('/songlist')
        })
    })
    // .post(function(req, res){
    //   var song_id = req.params.song_id;
    //   var songcart = new Songcart(req.session.songcart ? req.session.songcart : {
    //       songs: {}
    //   });
    //
    //   Song.findById(song_id, function(err, song) {
    //       if (err) {
    //           return res.redirect('/');
    //       }
    //       songcart.add(song, song_id);
    //       req.session.songcart = songcart
    //       console.log(req.session.songcart)
    //       res.redirect('/songlist')
    //   })
    // })


router.route('/:song_id/add-translation')
    .all(function(req, res, next) {
        song_id = req.params.song_id;
        song = {}
        Song.findById(song_id, function(err, s) {
            song = s;
            next();
        })
    })
    .get(function(req, res) {
        var temp = '';
        song.lyric.forEach(function(s) {
                temp += s + '\n'
            })
            // song.lyric = song.lyric.replace(/<br\s*\/?>|\//mg, '\n')
        res.render('addTranslation', {
            song: song,
            stringLyric: temp
        })
    })
    .post(function(req, res) {
        // console.log('hahhaa')
        var lang = req.body.lang_t
        var stringArr_t = req.body.lyric_t.split(/\r?\n|\//)
            // console.log(lang)
        Song.findOne({
                source: song.id,
                lang: lang
            }, function(err, translation) {
                // console.log('working')
                if (err) {
                    res.status(400).send('error ' + err)
                }
                var newSong = new Song({
                    title: req.body.title_t,
                    author: song.author,
                    year: song.year,
                    lang: lang,
                    contributor: req.user.username,
                    copyright: req.body.copyright_t,
                    lyric: stringArr_t.slice(0),
                    source: song.id,
                    oriSong: song.title,
                    timeAdded: Date.now()
                })
                if (translation) {
                    newSong.v = translation.v + 1
                } else {
                    newSong.v = 1;
                }
                // console.log(JSON.stringify(newSong))
                newSong.save(function(err) {
                    if (err) {
                        res.status(400).send('error saving new song ' + err)
                    } else {
                        res.redirect('/songlist/' + song_id)
                    }
                })
            })
            .sort({
                _id: -1
            }).limit(1)
    })

module.exports = router;

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return true && JSON.stringify(obj) === JSON.stringify({});
}

// var getLangAndVer = function(obj) {
//     return obj.map((t) => {
//         return {
//             lang: t.lang,
//             v: t.v
//         }
//     })
// }
