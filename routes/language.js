var express = require('express'),
  router = express.Router(),
  Song = require('../models/song'),
  User = require('../models/user'),
  Playlist = require('../models/playlist'),
  Language = require('../models/language'),
  passportFunction = require('../lib/passport');

router
  .route('/')
  .all(passportFunction.adminLoggedIn)
  .get(function(req, res, next) {
    Language.find(function(err, languages) {
      if (err) next(err);
      res.render('songs/language', {
        languages: languages
      });
    });
  })
  .post(function(req, res, next) {
    req.checkBody('label', 'Language label is required').notEmpty();
    req.checkBody('code', 'Langeage code is required').notEmpty();
    var label = req.body.label;
    var code = req.body.code;
    var errors = req.validationErrors();
    if (errors) {
        req.flash('error_messages', 'Invalid data entry');
        res.redirect('/language');
    } else {
        Language.findOne(
        {  code: code  },
        function(err, language) {
            if (err) next(err);
            if (!language) {
                var newLanguage = new Language({
                    label: label,
                    code: code
                });
                newLanguage.save(function(err) {
                    if (err) next(err);
                    req.flash('success_messages', 'Saved successfully!!!');
                    res.redirect('/language');
                });
            } else {
                Language.update(
                    {
                    code: code
                    },
                    {
                    label: label
                    },
                    {},
                    function(err, updated) {
                    if (err) next(err);
                    req.flash('success_messages', 'Updated successfully!!!');
                    res.redirect('/language');
                    }
                );
            }
        });
    }
  });

module.exports = router;
