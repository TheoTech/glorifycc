var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    helperFunc = require('../lib/passport')


// router.use('/', isAdminLoggedIn, function(req, res, next){
//   next()
// })

router.get('/test', function(req, res) {
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
                    // console.log(translations)
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
    var lyricArray = req.body.lyric.split(/\r?\n|\//)

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
                lyric: lyricArray,
                contributor: req.user.username,
                copyright: req.body.copyright,
                timeAdded: Date.now(),
                private: false
            })

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

router.delete('/:song_id', function(req, res){
  Song.remove({_id: req.params.song_id}, function(err){
    if (err) return handleError(err)
    res.send()
  })
})

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
        var lyric = song.lyric.reduce((prev, curr, i) => {
            if (i === 0) {
                return curr
            } else {
                return prev + '\n' + curr
            }
        }, '')
        res.render('edit', {
            song: song,
            lyric: lyric
        })
    })
    .post(function(req, res) {
        song.title = req.body.title
        song.author = req.body.author
        song.year = req.body.year
        song.lang = req.body.lang
        song.copyright = req.body.copyright
        song.contributor = req.body.contributor
        song.lyric = (req.body.lyric || '').split(/\r?\n|\//)
        song.save(function(err) {
            if (err) {
                res.status(400).send('Error editing the song: ' + error)
            } else {
                res.redirect('/songlist-db/')
            }
        })
    })

module.exports = router;

function isAdminLoggedIn(req, res, next) {
    if (helperFunc.isAdmin()) {
        console.log('hehhe')
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
