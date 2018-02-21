const express = require('express');
const router = express.Router();
const Song = require('../models/song');
const User = require('../models/user');
const _ = require('lodash');
const Playlist = require('../models/playlist');
const async = require('async');
const Language = require('../models/language');
const copyrightTypes = require('../lib/copyrightTypes');

router.get('/', function(req, res, next) {
  var messages = req.flash();
  var langsExist;
  Song.find(
    {
      copyright: {
        $ne: copyrightTypes.private
      }
    },
    function(err, songs) {
      if (err) {
        res.status(400).send('error getting song list ' + err);
      }
      //to get the what languages we need to include in the dropdown for filtering feature
      langsExist = _.uniq(songs.map(s => s.lang));
      if (req.isAuthenticated()) {
        User.findOne(
          {
            _id: req.user._id
          },
          function(err, user) {
            if (err) next(err);
            Playlist.find(
              {
                owner: req.user._id,
                song: {
                  $exists: false
                }
              },
              function(err, playlists) {
                if (err) next(err);
                res.render('index', {
                  songs: songs,
                  inLibrary: user.library,
                  playlists: playlists,
                  messages: messages,
                  langsExist: langsExist,
                  isLoggedIn: true
                });
              }
            );
          }
        );
      } else {
        res.render('index', {
          songs: songs,
          inLibrary: [],
          playlists: [],
          messages: messages,
          langsExist: langsExist,
          isLoggedIn: false
        });
      }
    }
  )
    .sort({
      title: 1
    })
    .limit(10);
});

router.post('/', function(req, res, next) {
  var id = req.body.id;
  User.findOne(
    {
      _id: req.user._id
    },
    function(err, user) {
      if (err) next(err);
      user.library.push(id);
      user.save(function(err) {
        if (err) next(err);
        res.send({
          inLibrary: user.library
        });
      });
    }
  );
});

router.delete('/', function(req, res, next) {
  var id = req.body.id;
  User.findOne(
    {
      _id: req.user._id
    },
    function(err, user) {
      if (err) next(err);
      var index = user.library.indexOf(id);
      if (index > -1) {
        user.library.splice(index, 1);
      }
      user.save(function(err) {
        if (err) next(err);
        res.send({
          inLibrary: user.library
        });
      });
    }
  );
});

function songFields(query) {
  return {
    $or: [
      {
        title: {
          $regex: query,
          $options: 'si' //s option to allow dot character to match all characters including new line
        }
      },
      {
        author: {
          $regex: query,
          $options: 'si'
        }
      },
      {
        lyrics: {
          $elemMatch: {
            $elemMatch: {
              $in: [query]
            }
          }
        }
      }
    ]
  };
}

function copyrightFields(username) {
  if (username) {
    return {
      $or: [
        {
          copyright: copyrightTypes.private,
          contributor: username
        },
        {
          copyright: {
            $ne: copyrightTypes.private
          }
        }
      ]
    };
  } else {
    return {
      copyright: {
        $ne: copyrightTypes.private
      }
    };
  }
}

router.get('/search', function(req, res, next) {
  var searchString = req.query.q;
  var query = new RegExp('.*' + searchString + '.*', 'im');

  function findSongs(username) {
    return function(done) {
      Song.find(
        {
          $and: [songFields(query), copyrightFields(username)]
        },
        function(err, songs) {
          if (err) {
            console.log(err);
          }
          done(null, songs);
        }
      ).sort({
        title: 1
      });
    };
  }

  function findInLibraryAndPlaylist(songs, done) {
    User.findById(req.user._id, function(err, user) {
      if (err) next(err);
      Playlist.find(
        {
          owner: req.user._id,
          song: {
            $exists: false
          }
        },
        function(err, playlists) {
          if (err) next(err);
          done(null, songs, user.library, playlists);
        }
      );
    });
  }

  function finalize(err, songs, inLibrary, playlists) {
    if (err) {
      res.status(500).send('Internal error' + err);
    } else {
      res.render('songs/search', {
        songs: songs,
        inLibrary: inLibrary || [],
        playlists: playlists || []
      });
    }
  }

  if (searchString) {
    if (req.isAuthenticated()) {
      async.waterfall(
        [findSongs(req.user.username), findInLibraryAndPlaylist],
        finalize
      );
    } else {
      //if the user not logged in then we dont need to findInLibraryAndPlaylist and just pass empty array
      //for inLibrary and playlists at the render
      async.waterfall([findSongs()], finalize);
    }
  } else {
    res.render('songs/search', {
      songs: [],
      inLibrary: [],
      playlists: []
    });
  }
});

module.exports = router;
