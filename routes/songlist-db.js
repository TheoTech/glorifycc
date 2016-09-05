var express = require('express'),
    router = express.Router(),
    Song = require('../models/song')

router.get('/', function(req, res) {
    Song.find(function(err, songs) {
        if (err) {
            res.status(400).send('error getting song list database ' + err)
        } else {
            res.render('songlist-db', {
                songs: songs
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
    new Song({
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
        language: req.body.language,
        copyright: req.body.copyright,
        lyric: req.body.lyric
    }).save(function(err, contact, count) {
        if (err) {
            res.status(400).send('error saving new song ' + err)
        } else {
            res.redirect('/songlist-db')
        }
    })
})

router.route('/:song_id')
    .all(function(req, res, next) {
        song_id = req.params.song_id;
        //console.log(song_id)
        song = {}
        Song.findById(song_id, function(err, s) {
            song = s;
            next();
        })
    })
    .get(function(req, res) {
        song.lyric = song.lyric.replace(/(?:\r\n|\r|\n|\/)/g, '<br>')
        res.render('song-editable', {
            song: song
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
        song.language = req.body.language
        song.copyright = req.body.copyright
        song.lyric = req.body.lyric

        song.save(function(err) {
            if (err) {
                res.status(400).send('Error editing the song: ' + error)
            } else {
                res.redirect('/songlist-db/')
            }
        })
    })

module.exports = router;
