var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport')
var Song = require('./models/song');
var flash = require('connect-flash');
var validator = require('express-validator')
var MongoStore = require('connect-mongo')(session);
var pdf = require('html-pdf');
var fs = require('file-system');
var nodemailer = require('nodemailer')
var config = require('config')

var app = module.exports = express();


var routes = require('./routes/index');
var songlist = require('./routes/songlist');
var songlistdb = require('./routes/songlist-db');
var searchbyletter = require('./routes/search-by-letter');
var searchbylang = require('./routes/search-by-lang');
var user = require('./routes/user');
var usersignup = require('./routes/user.signup');
var userplaylist = require('./routes/user.playlist');
var userlist = require('./routes/userlist')


var MongoURI = process.env.MONGOURI || 'mongodb://localhost/song-database';
mongoose.Promise = global.Promise;
mongoose.connect(MongoURI, function(err, database) {
    if (err) {
        console.log('Error connecting to: ' + MongoURI + '. ' + err);
    } else {
        console.log('MongoDB connected successfully to ' + MongoURI);
    }
});
require('./config/passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(session({
    secret: config.get('Session.key'),
}));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());

//Validator
app.use(validator({
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
    }
}));

//Global Variable
app.use(function(req, res, next) {
    res.locals.session = req.session;
    res.locals.login = req.isAuthenticated();
    res.locals.user = req.user;
    res.locals.isAdmin = false;
    // res.locals.isDownloadFinished = false;
    next();
})

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')))


app.use('/', routes);
app.use('/user', user)
app.use('/songlist', songlist);
app.use('/songlist-db', songlistdb)
app.use('/search-by-letter', searchbyletter)
app.use('/search-by-lang', searchbylang)
app.use('/userlist', userlist)
app.use('/user/signup', usersignup)
app.use('/user/playlist', userplaylist)

app.get('/api', function(req, res) {
    app.render('songs-in-pdf', function(err, html) {
      pdf.create(html).toStream(function(err, stream){
          stream.pipe(fs.createWriteStream('./foo.pdf'));
        });
      });
      res.download('./foo.pdf')
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


isObjEmpty = function(obj){
  return Object.keys(obj).length === 0 && obj.constructor === Object
}
