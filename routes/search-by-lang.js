var express = require('express');
var router = express.Router();
var Song = require('../models/song');


router.route('/:lang')
    .all(function(req, res, next) {
        lang = req.params.lang;
        //console.log(song_id)
        songs = {}
        var re = new RegExp(lang, "i")
        Song.find({
                language: re
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
