const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  'local.login',
  new LocalStrategy(
    {
      usernameField: 'usernameOrEmail',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, usernameOrEmail, password, done) {
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
      User.findOne(
        {
          $or: [
            {
              username: usernameOrEmail
            },
            {
              email: usernameOrEmail
            }
          ]
        },
        function(err, user) {
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
          } else {
            return done(null, user);
          }
        }
      );
    }
  )
);

function adminLoggedIn(req, res, next) {
  if (isAdmin(req)) {
    next();
  } else {
    res.redirect('/');
  }
}

function loggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/user/login');
  }
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
}

function isAdmin(req) {
  return req.user && req.user.username === 'admin';
}

module.exports = {
  adminLoggedIn,
  loggedIn,
  notLoggedIn,
  isAdmin
};
