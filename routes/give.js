var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('tools/give');
});

router.get('/thankyou', function (req, res, next) {
  res.render('messages/thankyou');
});

module.exports = router;
