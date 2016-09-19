var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    helperFunc = require('../config/passport')


// router.use('/', isAdminLoggedIn, function(req, res, next) {
//     next()
// })

router.get('/', function(req, res) {
    Song.find({
        source: null
    }, function(err, songs, count) {
        if (err) {
            res.status(400).send('error getting song list ' + err)
        } else {
            Song.find({
                source: {
                    $ne: null
                }
            }, function(err, translations) {
                if (err) {
                    res.status(400).send('error getting song translations ' + err)
                }
                songs = songs || [{}]
                translations = translations || [{}]
                // console.log(songs)
                console.log(translations)
                res.render('songlist-db', {
                    songs: songs,
                    translations: translations
                })
            })
        }
    })
})

router.get('/add', function(req, res) {
    res.render('add', {
        song: {}
    })
})


router.post('/add', function(req, res) {
    var title = req.body.title
    var stringArr = req.body.lyric.split(/\r?\n|\//)
    // var contributor = req.user.username || ''
    Song.findOne({
        title: title
    }, function(err, song) {
        if (err) {
            res.status(400).send('error ' + err)
        }
        if (song) {
            res.render('add', {
                msg: 'Song Exists',
                song: song
            });
        } else {
            var newSong = new Song({
                title: title,
                author: req.body.author,
                year: req.body.year,
                lang: req.body.lang,
                lyric: stringArr.slice(0),
                contributor: req.user.username,
                copyright: req.body.copyright,
                timeAdded: Date.now()
            })

            console.log(stringArr)
            // console.log(newSong.lyric)

            // console.log(JSON.stringify(newSong))
            newSong.save(function(err) {
                if (err) {
                    res.status(400).send('error saving new song ' + err)
                } else {
                    res.redirect('/songlist-db')
                }
            })
        }
    })
})

// router.post('/add', function(req, res) {
//     var title = req.body.title
//     var lang = req.body.language
//     var re = new RegExp(title, "i")
//     var query = {};
//     query[lang] = title;
//     Song.findOne({
//         title: {
//             $elemMatch: query
//         }
//     }, function(err, song) {
//         if (err) {
//             res.status(400).send('error ' + err)
//         }
//         if (!song) {
//             var newSong = new Song({
//                 author: req.body.author,
//                 year: req.body.year,
//                 copyright: req.body.copyright,
//             })
//             var tempTitle = {}
//             var tempLyric = {}
//             tempTitle[lang] = req.body.title
//             tempLyric[lang] = req.body.lyric
//             newSong.lang.push(lang)
//             newSong.title.push(tempTitle)
//             newSong.lyric.push(tempLyric);
//             console.log(JSON.stringify(newSong))
//             newSong.save(function(err) {
//                 if (err) {
//                     res.status(400).send('error saving new song ' + err)
//                 } else {
//                     res.redirect('/songlist-db')
//                 }
//             })
//         } else {
//             res.render('add', {
//                 msg: 'Song Exists',
//                 song: song
//             });
//         }
//         //var isExist = contains.call(song.lang, lang)
//         // if (isExist){
//
//         // } else {
//         //     //console.log('working')
//         //     var temp = {}
//         //     temp[lang] = req.body.lyric
//         //     song.lang.push(lang)
//         //     song.lyric.push(temp)
//         //     song.save(function(err) {
//         //         if (err) {
//         //             res.status(400).send('error saving new language ' + err)
//         //         } else {
//         //             res.redirect('/songlist-db')
//         //         }
//         //     })
//         // }
//         console.log(JSON.stringify(song))
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
        console.log(song_id)
        console.log('version: ' + v)
        Song.find({
            source: song.id
        }, function(err, t) {
            var langAndVers = getLangAndVer(t) || {}
            var rightTranslation = t.find((translation) => translation.lang === lang && translation.v == v) || {}
            var isTranslationExisted = !(Object.keys(rightTranslation).length === 0 && rightTranslation.constructor === Object);

            song.lyric = song.lyric.replace(/(?:\r\n|\r|\n|\/)/g, '<br>')
            if(isTranslationExisted){
              //if there is the rightTranslation
              console.log(rightTranslation)
              rightTranslation.lyric = rightTranslation.lyric.replace(/(?:\r\n|\r|\n|\/)/g, '<br>')
            }
            res.render('song', {
                song: song,
                langAndVers: langAndVers,
                rightTranslation: rightTranslation,
                isTranslationExisted: isTranslationExisted
            })
        })
    })
    .delete(function(req, res) {
        song.remove(function(err) {
            if (err) {
                res.status(400).send('Error')
            } else {
                res.send('remove the contact')
            }
        })
    })

// router.route('/:song_id')
//     .all(function(req, res, next) {
//       //var language = req.query.language || 'English';
//         song_id = req.params.song_id;
//         //console.log(song_id)
//         song = {}
//         //translations = {}
//         Song.findById(song_id, function(err, s) {
//             song = s;
//             next();
//         })
//         // Song.find({
//         //     source: song.id
//         // }, function(err, t) {
//         //     translations = t;
//         //     next()
//         // })
//     })
//     .get(function(req, res) {
//         song.lyric = song.lyric.replace(/(?:\r\n|\r|\n|\/)/g, '<br>')
//         res.render('song', {
//             song: song
//                 // translations: translations
//         })
//     })
    // .delete(function(req, res) {
    //     song.remove(function(err) {
    //         if (err) {
    //             res.status(400).send('Error')
    //         } else {
    //             res.send('remove the contact')
    //         }
    //     })
    // })


router.route('/:song_id/edit')
    .all(function(req, res, next) {
        song_id = req.params.song_id
        song = {}
        Song.findById(song_id, function(err, s) {
            song = s
            next()
        })
    })
    .get(function(req, res) {
        song.lang =
            song.lyric = song.lyric.replace(/<br\s*\/?>|\//mg, '\n')
        console.log(song.title)
        res.render('edit', {
            song: song
        })
    })
    .post(function(req, res) {
        song.title = req.body.title
        song.author = req.body.author
        song.year = req.body.year
        song.lang = req.body.lang
        song.copyright = req.body.copyright
        song.lyric = req.body.lyric
        song.contributor = req.body.contributor
        song.save(function(err) {
            if (err) {
                res.status(400).send('Error editing the song: ' + error)
            } else {
                res.redirect('/songlist-db/')
            }
        })
    })

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
            song.lyric = song.lyric.replace(/<br\s*\/?>|\//mg, '\n')
            res.render('addTranslation', {
                song: song
            })
        })
        .post(function(req, res) {
            console.log('hahhaa')
            var lang = req.body.lang_t
            console.log(lang)
            Song.findOne({
                    source: song.id,
                    lang: lang
                }, function(err, translation) {
                    console.log('working')
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
                        lyric: req.body.lyric_t,
                        source: song.id,
                        oriSong: song.title
                    })
                    if (translation) {
                        newSong.v = translation.v + 1
                    } else {
                        newSong.v = 1;
                    }
                    console.log(JSON.stringify(newSong))
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

var contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1,
                index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if ((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

function isAdminLoggedIn(req, res, next) {
    if (helperFunc.isAdmin()) {
        next()
    } else {
        res.redirect('/')
    }
}

var getLangAndVer = function(obj) {
    return obj.map((t) => {
        return {
            lang: t.lang,
            v: t.v
        }
    })
}
