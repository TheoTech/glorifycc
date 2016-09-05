var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');


router.get('/profile', isLoggedIn, function(req, res, next) {
    res.render('profile');
});

router.get('/logout', isLoggedIn, function(req, res, next) {
    req.logout();
    res.redirect('/')
})

router.use('/', notLoggedIn, function(req, res, next) {
    next()
})

router.get('/signup', function(req, res, next) {
    res.render('signup', {})
});

router.post('/signup', function(req, res, next) {
    //Validation Checks
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        //if there are errors in input
        res.render('signup', {
            errors: errors
        })
    } else {
        User.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                //if there is error
                res.status(400).send('error adding new user ' + err)
            } else if (user) {
                //if the user exists, display the msg
                res.render('signup', {
                    errors: [{
                        msg: 'Email is already used'
                    }]
                })
            } else {
                //if the user doesnt exist, create it
                var newUser = new User();
                newUser.email = req.body.email;
                newUser.password = newUser.generateHash(req.body.password);
                newUser.save(function(err, user, count) {
                    if (err) {
                        res.status(400).send('error adding new user ' + err)
                    } else {
                        res.redirect('/')
                    }
                })
            }
        })
    }
})

router.get('/login', function(req, res, next) {
    var messages = req.flash('error')
        //messages.push('please working')
    res.render('login', {
        messages: messages,
        hasErrors: messages.length > 0
    })
})

router.post('/login', passport.authenticate('local.login', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/login',
    failureFlash: true //turn the flag to true to enable flash message
}))






module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    }
    res.redirect('/')
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        next()
    }
    res.redirect('/')
}
// router.post('/login', passport.authenticate('local.login', {
//     successRedirect: '/user/profile'
//     failureRedirect: '/user/login'
//
// })function(req, res, next) {
//     //Validation Checks
//     req.checkBody('email', 'Email is required').notEmpty();
//     req.checkBody('password', 'Password is required').notEmpty();
//     var errors = req.validationErrors();
//
//     if (errors) {
//         //if there are errors in input
//         res.render('login', {
//             errors: errors
//         })
//     } else {}
// })


// function(req, res, next) {
//     passport.authenticate('local.signup', function(err, user, info) {
//         if (err) {
//             res.redirect('/user/signup')
//         }
//         res.redirect('/user/profile')
//     })(req, res, next);
// })


// router.get('/signin', function(req, res, next) {
//     var messages = req.flash('error');
//     res.render('user/signin', {hasErrors: messages.length > 0, messages: messages});
// });
//
// router.post('/signin', passport.authenticate('local.signin', {
//     successRedirect: '/profile',
//     failureRedirect: '/signin',
//     failureFlash: true
// }));
//
// router.get('/logout', function(req, res, next) {
//     req.logout();
//     return res.redirect('/');
// });



// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/');
// }

// });
//
// router.post('/signin', passport.authenticate('local.signin', {
//     successRedirect: '/profile',
//     failureRedirect: '/signin',
//     failureFlash: true
// }));
//
// router.get('/logout', function(req, res, next) {
//     req.logout();
//     return res.redirect('/');
// });



// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/');
// }
// }
