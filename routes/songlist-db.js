var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    passportFunction = require('../lib/passport'),
    Language = require('../models/language')


router.get('/', passportFunction.adminLoggedIn, function(req, res, next) {
    Song.find(function(err, songs) {
        if (err) return next(err);
        res.render('songlist-db', {
            songs: songs
        })
    })
})

router.delete('/:song_id', passportFunction.adminLoggedIn, function(req, res, next) {
    Song.remove({
        _id: req.params.song_id
    }, function(err) {
        if (err) return next(err)
        res.send()
    })
})


router.route('/add')
    .all(passportFunction.loggedIn)
    .get(function(req, res, next) {
        Language.find(function(err, languages) {
            if (err) next(err)
            res.render('add', {
                availableLanguages: languages.map((language) => language.lang),
                song: {
                    title: '',
                    author: '',
                    year: '',
                    lang: 'english',
                    copyright: 'CC0',
                    lyric: [
                        ['']
                    ]
                }
            })
        })

    })
    //add the song to database
    .post(function(req, res, next) {
        req.checkBody('title', 'Title is empty').notEmpty()
        req.checkBody('author', 'Author is empty').notEmpty()
        req.checkBody('year', 'Year is empty').notEmpty()
        var errors = req.validationErrors()
        if (errors) {
            res.send({
                errorMessages: errors.map((error) => error.msg)
            })
        } else {
            var data = req.body
            Song.findOne({
                title: data.title
            }, function(err, song) {
                if (err) {
                    res.status(400).send('error ' + err)
                }
                if (song) {
                    res.send({
                        errorMessages: ['Song Exists']
                    });
                } else {
                    var newSong = new Song({
                        title: data.title,
                        author: data.author,
                        year: data.year,
                        lang: data.lang,
                        lyric: data.lyric,
                        contributor: req.user.username,
                        copyright: data.copyright,
                        timeAdded: Date.now()
                    })
                    newSong.save(function(err) {
                        if (err) {
                            res.status(400).send('error saving new song ' + err)
                        } else if (data.copyright === 'private') {
                            User.findById(req.user._id, function(err, user) {
                                user.library.push(newSong._id)
                                user.save(function(err) {
                                    if (err) next(err)
                                    res.send({
                                        url: '/user/library'
                                    })
                                })
                            })
                        } else {
                            res.send({
                                url: '/user/library'
                            })
                        }
                    })
                }
            })
        }
    })

module.exports = router;
