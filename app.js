const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const Song = require('./models/song');
const flash = require('connect-flash');
const validator = require('express-validator');
const MongoStore = require('connect-mongo')(session);
const pdf = require('html-pdf');
const fs = require('file-system');
const nodemailer = require('nodemailer');
const config = require('config');
const _ = require('lodash');

const app = (module.exports = express());
const helmet = require('helmet');
app.use(helmet());

const index = require('./routes/index');
const songlistdb = require('./routes/songlist-db');
const user = require('./routes/user');
const usersignup = require('./routes/user.signup');
const userplaylist = require('./routes/user.playlist');
const userlist = require('./routes/userlist');
const songlist = require('./routes/songlist');
const song = require('./routes/song');
const language = require('./routes/language');
const contact = require('./routes/contact');
const discover = require('./routes/discover');
const help = require('./routes/help');
const legal = require('./routes/legal');
const give = require('./routes/give');

const mongoConfig = require('./lib/mongoConfig');
mongoose.connect(mongoConfig.uri, function(err, database) {
  if (err) {
    console.log('Error connecting to: ' + mongoConfig.uri + '. ' + err);
  } else {
    console.log('MongoDB connected successfully to ' + mongoConfig.uri);
  }
});
require('./lib/passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_KEY || config.get('Session.key')
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Validator
app.use(
  validator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    },
    customValidators: {
      arrayNotEmpty: function(arr) {
        return _.isEmpty(arr);
      }
    }
  })
);

//Global Variable
app.use(function(req, res, next) {
  res.locals.session = req.session;
  res.locals.login = req.isAuthenticated();
  res.locals.user = req.user;
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/', index);
app.use('/songlist', songlist);
app.use('/user', user);
app.use('/songlist-db', songlistdb);
app.use('/userlist', userlist);
app.use('/user/signup', usersignup);
app.use('/user/playlist', userplaylist);
app.use('/song', song);
app.use('/language', language);
app.use('/contact', contact);
app.use('/discover', discover);
app.use('/help', help);
app.use('/legal', legal);
app.use('/give', give);

app.get('/api', function(req, res, next) {
  app.render('songs-in-pdf', function(err, html) {
    pdf.create(html).toStream(function(err, stream) {
      stream.pipe(fs.createWriteStream('./foo.pdf'));
    });
  });
  res.download('./foo.pdf');
  // pdf.create(html).toBuffer(function(err, buffer){
  //     console.log('This is a buffer:', Buffer.isBuffer(buffer));
  //     res.download(buffer);
  // });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
