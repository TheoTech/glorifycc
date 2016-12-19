var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('give');
});

router.get('/thankyou', function (req, res, next) {
  res.render('thankyou');
});

module.exports = router;
