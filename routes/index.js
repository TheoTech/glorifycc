var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var User = require('../models/user')
var TempUser = require('../models/tempUser')
var app = require('../app')
var pdf = require('html-pdf')
var fs = require('file-system')
var async = require('async')
var nodemailer = require('nodemailer')
var mongoose = require('mongoose');
var nev = require('email-verification')(mongoose)


/* GET home page. */
router.get('/', function(req, res, next) {
    var messages = req.flash()
    Song.find(function(err, songs) {
            res.render('index', {
                songs: songs,
                messages: messages
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
        if (err) return handleError(err)
        if (req.isAuthenticated()) {
            User.findOne({
                _id: req.user._id
            }, function(err, user) {
                if (err) return handleError(err)
                res.render('songlist', {
                    songs: songs,
                    inLibrary: user.library
                })
            })
        } else {
            res.render('songlist', {
                songs: songs,
                inLibrary: []
            })
        }
    })
})




module.exports = router;
