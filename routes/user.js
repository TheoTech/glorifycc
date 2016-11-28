var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Playlist = require('../models/playlist');
var Song = require('../models/song');
var _ = require('lodash');
var passportFunction = require('../lib/passport');
var async = require('async');
var crypto = require('crypto');
var smtp = require('../lib/smtp');

/*
  The library route will provide the data to show the user the songs they have added to their library.
  These are songs they may want to use in the future, but haven't necessarily put into a playlist for use.
  It gives them a smaller view into the database of songs, of just the songs they are interested in instead
  of everything.
*/
router.route('/library')
    //protect the route from the user that hasn't logged in yet
    .all(passportFunction.loggedIn)
    .get(function(req, res, next) {
        var messages = req.flash()
        User.findById(req.user._id)
            .populate('library')
            .exec(function(err, user) {
                if (err) return next(err)
                Playlist.find({
                    owner: user._id,
                    song: {
                        $exists: false
                    }
                }, function(err, playlists) {
                    if (err) return next(err)
                    res.render('library', {
                        songs: user.library,
                        playlists: playlists,
                        messages: messages,
                        inLibrary: user.library
                    })
                })

            })
    })
    //adding new playlist
    .put(function(req, res, next) {
        var name = req.body.name
        if (req.isAuthenticated()) {
            var owner = req.user._id
            Playlist.findOne({
                owner: owner,
                name: name
            }, function(err, playlist) {
                if (err) return next(err)
                if (playlist) {
                    res.send({
                        playlistExists: true
                    })
                } else {
                    var newPlaylist = new Playlist({
                        owner: owner,
                        name: name
                    })
                    newPlaylist.save(function(err) {
                        if (err) return next(err)
                        Playlist.find({
                            owner: owner,
                            song: {
                                $exists: false
                            }
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
    //adding song to playlist
    .post(function(req, res, next) {
        var name = req.body.name
        var song_id = req.body.id
        var playlistOwner = req.user._id
        Playlist.findOne({
            owner: playlistOwner,
            name: name
        }, function(err, playlist) {
            if (err) return next(err)
            if (playlist) {
                var newPlaylistSong = new Playlist({
                    owner: playlistOwner,
                    name: name,
                    song: song_id,
                    //The user checks off songs the want to export.
                    //We store those songs in this array. This is so that if they refresh,
                    //they do not lose their selections.
                    translationsChecked: []
                })
                newPlaylistSong.save(function(err) {
                    if (err) next(err)
                    res.send({})
                })
            } else {
                req.flash('error', 'Choose Playlist')
                res.send({})
            }
        })
    })
    //delete song from library
    .delete(function(req, res, next) {
        var song_id = req.body.id
        User.findOne({
            _id: req.user._id
        }, function(err, u) {
            if (err) return next(err)
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


router.route('/login')
    .all(passportFunction.notLoggedIn)
    .get(function(req, res, next) {
        var messages = req.flash('error')
        res.render('login', {
            messages: messages,
            hasErrors: messages.length > 0
        })
    })
    .post(passport.authenticate('local.login', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true //turn the flag to true to enable flash message
    }))


router.get('/logout', passportFunction.loggedIn, function(req, res, next) {
    passportFunction.adminLogout()
    req.logout();
    res.redirect('/')
})

router.route('/forgot')
    .all(passportFunction.notLoggedIn)
    .get(function(req, res, next) {
        var messages = req.flash()
        console.log(messages)
        res.render('forgot', {
            user: req.user,
            messages: messages
        })
    })
    .post(function(req, res, next) {
        async.waterfall([
            function(done) {
                //creating the random generated url for reseting the password
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
                var mailOptions = {
                    to: user.email,
                    from: 'noreply@theotech.org',
                    subject: 'Reset Password',
                    text: 'Someone has requested to reset the password for your account at glorify.cc\n\n' +
                        'If you did not request this, you can ignore this message.\n\n' +
                        'Otherwise, please follow this link to reset your password:\n' +
                        (process.env.NODE_ENV ? 'https' : 'http') + '://' + req.headers.host + '/user/reset/' + token
                };
                smtp.smtpTransport.sendMail(mailOptions, function(err) {
                    req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/user/forgot');
        });
    });


router.route('/reset/:token')
    .all(passportFunction.notLoggedIn)
    .get(function(req, res, next) {
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
    })
    .post(function(req, res, next) {
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('confirm', 'Passwords do not match').equals(req.body.password);
        var errors = req.validationErrors()
        if (errors) {
            res.render('reset', {
                errors: errors
            })
        } else {
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
                    var mailOptions = {
                        to: user.email,
                        from: 'noreply@theotech.org',
                        subject: 'Your password has been changed',
                        text: 'Hello,\n\n' +
                            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                    };
                    smtp.smtpTransport.sendMail(mailOptions, function(err) {
                        req.flash('success', 'Success! Your password has been changed.');
                        done(err);
                    });
                }
            ], function(err) {
                res.redirect('/');
            });
        }

    });

module.exports = router;
