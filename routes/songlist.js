var express = require('express'),
    router = express.Router(),
    Song = require('../models/song')


router.get('/', function(req, res) {
    Song.find(function(err, songs, count) {
        if (err) {
            res.status(400).send('error getting song list ' + err)
        } else {
            res.render('songlist', {
                songs: songs
            })
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
        res.render('song', {
            song: song
        })
    })




module.exports = router;
