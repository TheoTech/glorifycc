'use strict';

import m from 'mithril';
import deleteButton from './deleteButton';

function deletePlaylist(name) {
  m
    .request({
      method: 'PUT',
      url: '/user/playlist',
      data: {
        name: name,
        redirect: true
      }
    })
    .then(function(res) {
      window.location.href = res.url;
    });
}

function noSongsPlaceholder(songs) {
  if (songs.length === 0) {
    return m('div', [
      'There are no songs in this playlist.',
      m('br'),
      m('a[href="/discover"]', 'Add songs to playlist.')
    ]);
  } else {
    return m('p');
  }
}

const playlistDetails = {
  view: vnode => {
    let { playlistName, songs } = vnode.attrs;
    return m('div', [
      m('h1', playlistName()),
      noSongsPlaceholder(songs()),
      m('table.table', [
        m('tbody', [
          songs().map(s => {
            return [
              m('tr', [
                m('td', [
                  m(
                    'a',
                    {
                      href: '/song/' + s._id
                    },
                    s.title
                  ),
                  m('span', ' by ' + s.author)
                ]),
                m('td', [
                  m(deleteButton, {
                    songID: s._id,
                    url: '/user/playlist',
                    songs: songs,
                    name: playlistName()
                  })
                ])
              ])
            ];
          })
        ])
      ]),
      m('div', [
        m(
          'a.btn.btn-primary',
          {
            href:
              '/user/playlist/' +
              encodeURIComponent(playlistName()) +
              '/export1'
          },
          'Export Playlist'
        ),
        m(
          'button.btn.btn-default.pull-right',
          {
            onclick: function() {
              if (confirm('Do you want to delete this playlist?')) {
                deletePlaylist(playlistName());
              }
            }
          },
          'Delete Playlist'
        )
      ])
    ]);
  }
};

export default playlistDetails;
