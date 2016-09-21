var express = require('express');
var router = express.Router();
var Song = require('../models/song');


router.route('/:letter')
    .all(function(req, res, next) {
        letter = req.params.letter;
        //console.log(song_id)
        songs = {}
        var re = new RegExp("^" + letter, "i")
        Song.find({
                title: re
            },
            function(err, s) {
                songs = s;
                next();
            })
    })
    .get(function(req, res) {
        res.render('songlist', {
            songs: songs
        })
    })


module.exports = router;
