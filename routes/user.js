var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Playlist = require('../models/playlist')
var Song = require('../models/song')
var ExportSong = require('../models/exportSong')
var _ = require('lodash')
var helperFunc = require('../lib/passport')
var async = require('async')
var crypto = require('crypto')
var nodemailer = require('nodemailer')
var config = require('config')

// router.get('/profile', function(req, res){
//   res.render('profile', {});
// })

router.get('/library/search', function(req, res) {
    var tag = req.query.q
    var messages = req.flash()
    User.findOne({
            _id: req.user._id
        })
        .populate('library')
        .exec(function(err, user) {
            if (err) return handleError(err)
            Playlist.find({
                owner: user._id
            }, function(err, playlists) {
                if (err) return handleError(err)
                res.render('library', {
                    songs: user.library.filter((s) => {
                        return (s.title.search(tag) !== -1 ||
                            s.lang.search(tag) !== -1 ||
                            s.author.search(tag) !== -1)
                    }),
                    playlists: playlists,
                    messages: messages
                })
            })
        })
})

router.get('/library', isLoggedIn, function(req, res, next) {
    var messages = req.flash()
    User.findById(req.user._id)
        .populate('library')
        .exec(function(err, user) {
            if (err) return handleError(err)
            Playlist.find({
                owner: user._id
            }, function(err, playlists) {
                if (err) return handleError(err)
                res.render('library', {
                    songs: user.library,
                    playlists: playlists,
                    messages: messages,
                    inLibrary: user.library
                })
            })

        })
})

router.put('/library', function(req, res) {
    var name = req.body.name
    var url = req.body.url
    if (req.isAuthenticated()) {
        var owner = req.user._id
        Playlist.findOne({
            owner: owner,
            name: name
        }, function(err, playlist) {
            if (err) return handleError(err)
            if (playlist) {
                req.flash('error', 'Playlist exists. Choose different name')
                res.send({
                    url: url
                })
            } else {
                var newPlaylist = new Playlist({
                    owner: owner,
                    name: name
                })
                newPlaylist.save(function(err) {
                    if (err) return handleError(err)
                    Playlist.find({
                        owner: owner
                    }, function(err, playlists) {
                        res.send({
                            playlists: playlists
                        })
                    })

                })
            }
        })
    } else {
        res.send({
            url: '/user/login'
        })
    }

})

router.post('/library', function(req, res, next) {
    var name = req.body.name
    var song_id = req.body.id
    var url = req.body.url
    console.log(url)
    if (req.isAuthenticated()) {
        Playlist.findOne({
                owner: req.user._id,
                name: name
            })
            .populate('owner')
            .exec(function(err, playlist) {
                var newPlaylist
                if (err) return handleError(err)
                if (playlist) {
                    playlist.songs.push(song_id)
                    playlist.save(function(err) {
                        if (err) {
                            res.status(400).send('failed ' + err)
                        } else {
                            res.send({})
                        }
                    })
                } else {
                    req.flash('error', 'Choose Playlist')
                    res.send({
                        url: url
                    })
                }
            })
    } else {
        res.send({
            url: '/user/login'
        })
    }

})

router.delete('/library', function(req, res, next) {
    // var name = req.body.name
    var song_id = req.body.id
    User.findOne({
        _id: req.user._id
    }, function(err, u) {
        if (err) return handleError(err)
        var index = u.library.indexOf(song_id)
        if (index > -1) {
            u.library.splice(index, 1)
        }
        u.save(function(err) {
            if (err) {
                res.status(400).send('error deleting song ' + err)
            } else {
                User.findOne({
                        _id: req.user._id
                    })
                    .populate('library')
                    .exec(function(err, user) {
                        res.send({
                            songs: user.library,
                            msg: 'deleting done'
                        })
                    })
            }
        })
    })
})




router.get('/logout', isLoggedIn, function(req, res, next) {
    helperFunc.adminLogout()
    req.logout();
    res.redirect('/')
})

router.get('/forgot', function(req, res) {
    var messages = req.flash()
    console.log(messages)
    res.render('forgot', {
        user: req.user,
        messages: messages
    })
})


router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/user/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USER || config.get('emailVerification.user'),
                    pass: process.env.SENDGRID_PASS || config.get('emailVerification.pass')
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@donotreply',
                subject: 'Reset Password',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/user/forgot');
    });
});


router.get('/reset/:token', function(req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/user/forgot');
        }
        res.render('reset', {
            user: req.user
        });
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                user.password = user.generateHash(req.body.password);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USER || config.get('emailVerification.user'),
                    pass: process.env.SENDGRID_PASS || config.get('emailVerification.pass')
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@donotreply',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});


// router.use('/', notLoggedIn, function(req, res, next) {
//     next()
// })




router.get('/login', function(req, res, next) {
    var messages = req.flash('error')
    res.render('login', {
        messages: messages,
        hasErrors: messages.length > 0
    })
})

router.post('/login', passport.authenticate('local.login', {
    successRedirect: '/',
    failureRedirect: '/user/login',
    failureFlash: true //turn the flag to true to enable flash message
}))







module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/')
    }
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/user/signup')
    }
}
