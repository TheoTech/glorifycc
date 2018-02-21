'use strict';

import $ from 'jquery';
import m from 'mithril';
import prop from 'mithril/stream';
import { isEmpty, remove } from 'lodash';

let currentPlaylists = prop([]);
// HACK
if (window.playlistRaw) {
  currentPlaylists(playlistRaw);
}

let playlistTable = {
  view: () => {
    if (isEmpty(currentPlaylists())) {
      return m('h4', 'You have no playlists yet.');
    } else {
      return m('table.table', [
        m('thead', [
          m(
            'th',
            {
              style: {
                'font-size': '18px',
                padding: '10px'
              }
            },
            'Playlist Name'
          )
        ]),
        m('tbody', [
          currentPlaylists().map(function(pl) {
            return m('tr', [
              m('td', [
                m(
                  'a',
                  {
                    href: '/user/playlist/' + encodeURIComponent(pl.name)
                  },
                  pl.name
                )
              ]),
              m('td', [
                m(
                  'button.btn.btn-default.pull-right',
                  {
                    onclick: function() {
                      if (confirm('Do you want to delete this playlist?')) {
                        deletePlaylist(pl.name);
                        remove(currentPlaylists(), function(n) {
                          return n.name === pl.name;
                        });
                      }
                    }
                  },
                  'Delete Playlist'
                )
              ])
            ]);
          })
        ])
      ]);
    }
  }
};

function deletePlaylist(name) {
  return m.request({
    method: 'PUT',
    url: '/user/playlist',
    data: {
      name: name,
      redirect: false
    }
  });
}

function addPlaylist(name, url) {
  return m
    .request({
      method: 'PUT',
      url: '/user/library',
      data: {
        name: name,
        url: url
      }
    })
    .then(function(res) {
      if (res.url) {
        window.location.href = res.url;
      } else {
        currentPlaylists(res.playlists);
      }
    });
}

function enter(elem) {
  $(elem).keyup(e => {
    if (e.keyCode == 13) {
      $('#create').click();
    }
  });
}

let playlistName = prop('New Playlist');

let addNewPlaylist = {
  view: () => {
    return [
      m(
        'button.btn.btn-default',
        {
          'data-toggle': 'modal',
          'data-target': '#newPlaylist'
        },
        [m('i.glyphicon.glyphicon-plus')],
        ' Add New Playlist'
      ),
      m('#newPlaylist.modal.fade[role=dialog]', [
        m('.modal-dialog.modal-sm', [
          m('.modal-content', [
            m('.modal-header', [
              m('.modal-title', [
                m('h4', [
                  'Create Playlist',
                  m(
                    'button.close[data-dismiss="modal"]',
                    {
                      style: {
                        color: 'white'
                      }
                    },
                    [m('span', m.trust('&times;'))]
                  )
                ])
              ])
            ]),
            m('.modal-body', [
              m('label', 'Enter Playlist Name'),
              m('input.form-control[name=playlist type=text]', {
                value: playlistName(),
                onchange: m.withAttr('value', playlistName),
                oncreate: vnode => {
                  enter(vnode.dom);
                }
              }),
              m('br'),
              m(
                'button.btn.btn-default#create',
                {
                  'data-dismiss': 'modal',
                  onclick: () => {
                    addPlaylist(playlistName());
                    window.location.href =
                      '/discover?playlist=' + playlistName();
                  }
                },
                'Create'
              )
            ])
          ])
        ])
      ])
    ];
  }
};

export { playlistTable, addNewPlaylist };
