var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var Songcart = require('../models/songcart')


/* GET home page. */
router.get('/', function(req, res, next) {
    Song.find(function(err, songs) {
            res.render('index', {
                songs: songs
            })
        })
        .sort({
            _id: -1
        }).limit(5)
})

router.post('/', function(req, res, next) {
    Song.find({
        $text: {
            $search: "\"" + req.body.search + "\""
        }
    }, function(err, songs) {
        res.render('songlist', {
            songs: songs
        })
    })
})

router.get('/songcart/:song_id', function(req, res) {
    var song_id = req.params.song_id;
    var songcart = new Songcart(req.session.songcart ? req.session.songcart : {
        songs: {}
    });

    Song.findById(song_id, function(err, song) {
        if (err) {
            return res.redirect('/');
        }
        songcart.add(song, song_id);
        req.session.songcart = songcart
        console.log(req.session.songcart)
        res.redirect('/songlist')
    })
})


module.exports = router;
