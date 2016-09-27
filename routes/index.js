var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var app = require('../app')
var pdf = require('html-pdf')
var fs = require('file-system')


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





module.exports = router;
