var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('help', {});
});

router.get('/createslide', function(req, res, next) {
    res.render('help-createSlide', {});
});

router.get('/addingsongs', function(req, res, next) {
    res.render('help-addingSongs', {});
});

module.exports = router;
