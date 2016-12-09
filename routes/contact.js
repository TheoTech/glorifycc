var express = require('express');
var router = express.Router();
var smtp = require('../lib/smtp');

router.get('/', function(req, res, next) {
    res.render('contact');
});

router.post('/', function(req, res, next) {
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('message', 'Message is required').notEmpty();
    var email = req.body.email;
    var subject = req.body.subject;
    var question = req.body.message;
    var errors = req.validationErrors();
    if (errors) {
        res.render('contact', {
            errors: errors
        })
    } else {
        var mailOptions = {
            to: process.env.OUR_EMAIL || config.get('ourEmail'),
            from: email,
            subject: (subject === '') ? 'Subject not specified' : subject,
            text: question
        };
        smtp.smtpTransport.sendMail(mailOptions, function(err) {
            if (err) next(err);
            req.flash('success_messages', 'Your message has been successfully sent');
            res.redirect('/contact');
        });
    }
});

module.exports = router;
