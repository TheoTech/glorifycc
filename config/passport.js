var passport = require('passport')
var User = require('../models/user')
var LocalStrategy = require('passport-local').Strategy


passport.serializeUser(function(user, done) {
    done(null, user.id)
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user)
    })
})

passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    console.log(email)
    console.log(password)
    req.checkBody('email', 'Invalid email').notEmpty();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    console.log(errors)
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        console.log(messages)
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({
        'email': email
    }, function(err, user) {
        console.log('hehehe')
        if (err) {
            return done(err);
        } else if (!user) {
            console.log('usernotfound')
            return done(null, false, {
                message: 'No user found.'
            });
        } else if (!user.validPassword(password)) {
            return done(null, false, {
                message: 'Wrong password.'
            });
        } else {
            return done(null, user);
        }
    });
}));
