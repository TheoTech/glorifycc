var passport = require('passport')
var User = require('../models/user')
var LocalStrategy = require('passport-local').Strategy

var isAdmin = false;

passport.serializeUser(function(user, done) {
    done(null, user.id)
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user)
    })
})

passport.use('local.login', new LocalStrategy({
    usernameField: 'usernameOrEmail',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, usernameOrEmail, password, done) {
    req.checkBody('usernameOrEmail', 'Invalid username or email').notEmpty();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({
        $or: [{
            username: usernameOrEmail
        }, {
            email: usernameOrEmail
        }]
    }, function(err, user) {
        if (err) {
            return done(err);
        } else if (!user) {
            return done(null, false, {
                message: 'No user found.'
            });
        } else if (!user.validPassword(password)) {
            return done(null, false, {
                message: 'Wrong password.'
            });
        } else if (user.username === "admin") {
            isAdmin = true;
            return done(null, user);
        } else {
            return done(null, user)
        }
    });
}));

module.exports.isAdmin = function(req, res, next) {
    if (isAdmin) {
        next()
    } else {
        res.redirect('/')
    }
}

module.exports.adminLogout = function() {
    isAdmin = false
    return
}

// m isAdminLoggedIn(req, res, next) {
//     if (helperFunc.isAdmin()) {
//         next()
//     } else {
//
//     }
// }
