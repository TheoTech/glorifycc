var express = require('express');
var router = express.Router();
var Song = require('../models/song');
var User = require('../models/user')
var TempUser = require('../models/tempUser')
var app = require('../app')
var pdf = require('html-pdf')
var fs = require('file-system')
var async = require('async')
var nodemailer = require('nodemailer')
var mongoose = require('mongoose');
var nev = require('email-verification')(mongoose)


/* GET home page. */
router.get('/', function(req, res, next) {
    var messages = req.flash()
    Song.find(function(err, songs) {
            res.render('index', {
                songs: songs,
                messages: messages
            })
        })
        .sort({
            _id: -1
        }).limit(5)
})

router.post('/', function(req, res, next) {
    Song.find({
        $text: {
            $search: "\"" + req.body.search + "\""
        }
    }, function(err, songs) {
        if (err) return handleError(err)
        if (req.isAuthenticated()) {
            User.findOne({
                _id: req.user._id
            }, function(err, user) {
                if (err) return handleError(err)
                res.render('songlist', {
                    songs: songs,
                    inLibrary: user.library
                })
            })
        } else {
            res.render('songlist', {
                songs: songs,
                inLibrary: []
            })
        }
    })
})




/*
	Here we are configuring our SMTP Server details.
	STMP is mail server which is responsible for sending and recieving email.
*/
// var smtpTransport = nodemailer.createTransport("SMTP", {
//     service: "SendGrid",
//     auth: {
//         user: "jbenhi",
//         pass: "Phil4:13"
//     }
// });
// var rand, mailOptions, host, link;
/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/

// app.get('/', function(req, res) {
//     res.sendfile('index.html');
// });
// router.get('/send', function(req, res) {
//   var smtpTransport = nodemailer.createTransport("SMTP", {
//       service: "SendGrid",
//       auth: {
//           user: "jbenhi",
//           pass: "Phil4:13"
//       }
//   });
//   var rand, mailOptions, host, link;
//     rand = Math.floor((Math.random() * 100) + 54);
//     host = req.get('host');
//     link = "http://" + req.get('host') + "/verify?id=" + rand;
//     mailOptions = {
//         to: 'jonathanbenhi@gmail.com',
//         subject: "Please confirm your Email account",
//         html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
//     }
//     console.log(mailOptions);
//     smtpTransport.sendMail(mailOptions, function(error, response) {
//         if (error) {
//             console.log(error);
//             res.end("error");
//         } else {
//             console.log("Message sent: " + response.message);
//             res.end("sent");
//         }
//     });
// });
//
// router.get('/verify', function(req, res) {
//     console.log(req.protocol + ":/" + req.get('host'));
//     if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
//         console.log("Domain is matched. Information is from Authentic email");
//         if (req.query.id == rand) {
//             console.log("email is verified");
//             res.end("<h1>Email " + mailOptions.to + " is been Successfully verified");
//         } else {
//             console.log("email is not verified");
//             res.end("<h1>Bad Request</h1>");
//         }
//     } else {
//         res.end("<h1>Request is from unknown source");
//     }
// });






module.exports = router;
