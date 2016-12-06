var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    _ = require('lodash'),
    Playlist = require('../models/playlist'),
    Language = require('../models/language')

router.get('/', function(req, res, next) {
    Language.find(function(err, languages) {
        if (err) next(err)
        res.render('language', {
            languages: languages
        })
    })
})

router.post('/', function(req, res, next) {
    var label = req.body.label
    var code = req.body.code
    Language.findOne({
        code: code
    }, function(err, language) {
        if (err) next(err)
        if (!language) {
            var newLanguage = new Language({
                label: label,
                code: code
            })
            newLanguage.save(function(err) {
                if (err) next(err)
                res.redirect('/language')
            })
        } else {
            req.flash('error_messages', 'Language already in the dabase')
            res.redirect('/language')
        }
    })
})

module.exports = router;
