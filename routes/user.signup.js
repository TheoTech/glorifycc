var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mongoose = require('mongoose');
var nev = require('email-verification')(mongoose);
var bcrypt = require('bcrypt-nodejs');
var config = require('config')

router.get('/', function(req, res, next) {
    res.render('signup', {})
});


var myHasher = function(password, tempUserData, insertTempUser, callback) {
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return insertTempUser(hash, tempUserData, callback);
};

// NEV configuration =====================
nev.configure({
    persistentUserModel: User,
    expirationTime: 600, // 10 minutes
    verificationURL: process.env.VERIFICATION_URL || config.get('Nev.verificationURL'),
    transportOptions: {
        service: 'SendGrid',
        auth: {
            user: process.env.SENDGRID_USER || config.get('Nev.user'),
            pass: process.env.SENDGRID_PASS || config.get('Nev.pass')
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

nev.generateTempUserModel(User, function(err, tempUserModel) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
});


router.post('/', function(req, res) {
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

        // if (req.body.type === 'register') {
        var password = req.body.password;
        var newUser = new User({
            username: username,
            email: email,
            password: password
        });
        console.log(newUser)
        nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
            if (err) {
                return res.status(404).send('ERROR: creating temp user FAILED');
            }

            // user already exists in persistent collection
            if (existingPersistentUser) {
                res.render('signup', {
                    messages: [{msg: 'You have already signed up and confirmed your account. Did you forget your password?'}],
                    info: 'btn-danger'
                });
            }

            // new user created
            if (newTempUser) {
                var URL = newTempUser[nev.options.URLFieldName];

                nev.sendVerificationEmail(email, URL, function(err, info) {
                    if (err) {
                        return res.status(404).send('ERROR: sending verification email FAILED');
                    }
                    res.render('signup', {
                        messages: [{msg: 'An email has been sent to you. Please check it to verify your account.'}],
                        info: 'btn-success'
                    });
                });

                // user already exists in temporary collection!
            } else {
                res.render('signup', {
                    messages: [{msg: 'You have already signed up. Please check your email to verify your account.'}],
                    info: 'btn-danger'
                });
            }
        });

        // resend verification button was clicked
        // } else {
        //   nev.resendVerificationEmail(email, function(err, userFound) {
        //     if (err) {
        //       return res.status(404).send('ERROR: resending verification email FAILED');
        //     }
        //     if (userFound) {
        //       res.json({
        //         msg: 'An email has been sent to you, yet again. Please check it to verify your account.'
        //       });
        //     } else {
        //       res.json({
        //         msg: 'Your verification code has expired. Please sign up again.'
        //       });
        //     }
        //   });
        // }
    }

})

router.get('/email-verification/:URL', function(req, res) {
    var url = req.params.URL;
    console.log(url)
    nev.confirmTempUser(url, function(err, user) {
        if (user) {
            nev.sendConfirmationEmail(user.email, function(err, info) {
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
