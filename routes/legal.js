var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('messages/tos', {});
});

router.get('/tos', function(req, res, next) {
    res.render('messages/tos', {});
});

router.get('/privacy', function(req, res, next) {
    res.render('messages/privacy', {});
});

module.exports = router;
