var express = require('express'),
    router = express.Router(),
    User = require('../models/user')


router.get('/', function(req, res) {
    User.find(function(err, users, count) {
        if (err) {
            res.status(400).send('error getting user list ' + err)
        } else {
            res.render('userlist', {
                users: users
            })
        }
    })
})


router.route('/:user_id')
    .all(function(req, res, next) {
        user_id = req.params.user_id;
        //console.log(user_id)
        user = {}
        User.findById(user_id, function(err, u) {
            user = u
            next();
        })
    })
    // .get(function(req, res) {
    //     //console.log(user.lang)
    //     user.lang.forEach(function(lang) {
    //             console.log(lang)
    //             user.lyric[lang] = user.lyric[lang].replace(/(?:\r\n|\r|\n|\/)/g, '<br>')
    //         })
    //         // console.log(user.lyric.english)
    //         // console.log(user.lyric.mandarin)
    //     res.render('user', {
    //         user: user
    //     })
    // })




module.exports = router;
