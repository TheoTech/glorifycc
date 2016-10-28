var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mongoose = require('mongoose');
var emailVerification = require('email-verification')(mongoose);
var bcrypt = require('bcrypt-nodejs');
var config = require('config')

var TempUser = mongoose.model('Tempuser',
    new mongoose.Schema(),
    'tempusers'); // collection name

var myHasher = function(password, tempUserData, insertTempUser, callback) {
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return insertTempUser(hash, tempUserData, callback);
};

// emailVerification configuration
emailVerification.configure({
    persistentUserModel: User,
    tempUserCollection: 'tempuser',
    expirationTime: 600, // 10 minutes
    verificationURL: process.env.VERIFICATION_URL || config.get('emailVerification.verificationURL'),
    transportOptions: {
        service: 'SendGrid',
        auth: {
            user: process.env.SENDGRID_USER || config.get('emailVerification.user'),
            pass: process.env.SENDGRID_PASS || config.get('emailVerification.pass')
        }
    },
    hashingFunction: myHasher,
    passwordFieldName: 'password',
}, function(err, options) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('configured: ' + (typeof options === 'object'));
});

emailVerification.generateTempUserModel(User, function(err, tempUserModel) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
});

router.get('/', function(req, res, next) {
    res.render('signup', {})
})


router.post('/', function(req, res, next) {
    //Validation Checks
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var messages = req.validationErrors()

    if (messages) {
        res.render('signup', {
            messages: messages,
            info: 'btn-danger'
        })
    } else {
        var username = req.body.username
        var email = req.body.email;
        var password = req.body.password;
        var newUser = new User({
            username: username,
            email: email,
            password: password
        });

        //this part is for solving the issue when one user signs up with a username and he hasnt verified it,
        //and there is another person who tries to sign up with the same username.
        TempUser.findOne({
            username: username
        }, function(err, tu) {
            if (err) return next(err)
            console.log(tu)
            if (tu) {
                res.render('signup', {
                    messages: [{
                        msg: 'You have already signed up. Please check your email to verify your account.'
                    }],
                    info: 'btn-danger',
                    resend: true
                });
            } else {
                emailVerification.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
                    if (err) {
                        return res.status(404).send('ERROR: creating temp user FAILED');
                    }

                    // user already exists in persistent collection
                    if (existingPersistentUser) {
                        res.render('signup', {
                            messages: [{
                                msg: 'You have already signed up and confirmed your account. Did you forget your password?'
                            }],
                            info: 'btn-danger',
                            resend: false
                        });
                    } else if (newTempUser) {
                        // new user created
                        var URL = newTempUser[emailVerification.options.URLFieldName];

                        emailVerification.sendVerificationEmail(email, URL, function(err, info) {
                            if (err) {
                                return res.status(404).send('ERROR: sending verification email FAILED');
                            }
                            res.render('signup', {
                                messages: [{
                                    msg: 'An email has been sent to you. Please check it to verify your account.'
                                }],
                                info: 'btn-success',
                                resend: true
                            });
                        });
                    } else {
                        // user already exists in temporary collection compared by email
                        res.render('signup', {
                            messages: [{
                                msg: 'You have already signed up. Please check your email to verify your account.'
                            }],
                            info: 'btn-danger',
                            resend: true
                        });
                    }
                });
            }
        })
    }
})

router.get('/resend', function(req, res, next){
  var messages = req.flash()
  res.render('resend', {messages: messages})
})
router.post('/resend', function(req, res, next) {
    var email = req.body.email
    emailVerification.resendVerificationEmail(email, function(err, userFound) {
        if (err) {
            return res.status(404).send('ERROR: resending verification email FAILED');
        }
        if (userFound) {
            req.flash('success', 'An email has been sent to you, yet again. Please check it to verify your account.')
        } else {
            req.flash('error', 'No account with that email address exists. You have to signup')
        };
        res.redirect('/user/signup/resend')
    })
});

router.get('/email-verification/:URL', function(req, res, next) {
    var url = req.params.URL;
    console.log(url)
    emailVerification.confirmTempUser(url, function(err, user) {
        if (user) {
            emailVerification.sendConfirmationEmail(user.email, function(err, info) {
                if (err) {
                    return res.status(404).send('ERROR: sending confirmation email FAILED');
                }
                console.log('success')
                res.render('success');
            });
        } else {
            return res.status(404).send('ERROR: confirming temp user FAILED');
        }
    });
});


module.exports = router
