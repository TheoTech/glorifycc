var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    _ = require('lodash'),
    Playlist = require('../models/playlist'),
    Language = require('../models/language')

var languageOptions = ['english', 'mandarin', 'spanish', 'portuguese', 'bahasa']

router.get('/', function(req, res, next) {
    Language.find(function(err, languages) {
        if (err) next(err)
        res.render('language', {
            availableLanguages: languages,
            languageOptions: languageOptions
        })
    })
})

router.post('/', function(req, res, next) {
    var selectedLanguage = req.body.lang
    Language.findOne({
            lang: selectedLanguage
        }, function(err, language) {
            if (err) next(err)
            if (!language) {
                var newLanguage = new Language({
                    lang: selectedLanguage
                })
                newLanguage.save(function(err) {
                    if (err) next(err)
                    res.redirect('/language')
                })
            } else {
                res.redirect('/language')
            }
        })
        // var selectedLanguage = req.body
        // console.log(selectedLanguage)
        // Language.findOne({
        //     code: selectedLanguage.code
        // }, function(err, language) {
        //     if (err) next(err)
        //     console.log('exist')
        //     if (_.isEmpty(language)) {
        //         console.log('not exist')
        //         var newLanguage = new Language({
        //             lang: selectedLanguage.lang,
        //             code: selectedLanguage.code
        //         })
        //         newLanguage.save(function(err) {
        //             if (err) next(err)
        //             console.log('test2')
        //             res.send({
        //                 url: '/language'
        //             })
        //         })
        //     }
        // })
})

module.exports = router;
