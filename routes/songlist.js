var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user')


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

router.post('/', function(req, res) {
        var id = req.body.id
        console.log(typeof(id))
        if (req.isAuthenticated()) {
            User.findOne({
                username: req.user.username
            }, function(err, user) {
                if (err) return handleError(err)
                User.findOne({
                        library: id
                    })
                    .populate('library')
                    .exec(function(err, song) {
                        console.log(JSON.stringify(song))
                        if (err) return handleError(err)
                          if (song) {
                            console.log('hahhaa')
                            res.send({
                                msg: 'You already have this song',
                                status: 'alert-danger'
                            })
                        } else {
                            console.log('hehehe')
                            user.library.push(id)
                            user.save(function(err) {
                                if (err) return handleError(err)
                                console.log('save success')
                                res.send({
                                    msg: 'Song added to your library',
                                    status: 'alert-success'
                                })
                            })
                        }
                    })
            })
        } else {
            res.send({
                url: '/user/signup'
            })
        }
    })



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
                    rightTranslation: rightTranslation,
                    isTranslationExisted: isTranslationExisted,
                    translations: translations
                })
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
        var temp = '';
        song.lyric.forEach(function(s) {
                temp += s + '\n'
            })
        res.render('addTranslation', {
            song: song,
            stringLyric: temp
        })
    })
    .post(function(req, res) {
        var lang = req.body.lang_t
        var stringArr_t = req.body.lyric_t.split(/\r?\n|\//)
        Song.findOne({
                source: song.id,
                lang: lang
            }, function(err, translation) {
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
