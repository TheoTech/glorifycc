'use strict';

import $ from 'jquery';
import m from 'mithril';
import prop from 'mithril/stream';
import { isEmpty, remove } from 'lodash';

let playlistName = prop('');

let playlistTable = {
  view: vnode => {
    let args = vnode.attrs;
    if (isEmpty(args.currentPlaylists())) {
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
          args.currentPlaylists().map(function(pl) {
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
              m(
                'td',
                m(
                  '.row',
                  m('.col-xs-12', [
                    m(
                      'button.btn.btn-default.pull-right',
                      {
                        onclick: () => {
                          if (confirm('Do you want to delete this playlist?')) {
                            deletePlaylist(pl.name);
                            remove(args.currentPlaylists(), function(n) {
                              return n.name === pl.name;
                            });
                          }
                        }
                      },
                      ' Delete Name '
                    ),
                    m(
                      'button.btn.btn-default.pull-right',
                      {
                        onclick: () => {
                          editPlaylist(pl.name, pl._id);
                        }
                      },
                      '  Edit Name  '
                    )
                  ])
                )
              )
            ]);
          })
        ])
      ]);
    }
  }
};

function editPlaylist(name, id) {
  // TODO
}

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

function saveAfterConfirm(args, name) {
  return new Promise((resolve, reject) => {
    if (name.indexOf('#') > -1) {
      return reject('# is not allowed for playlist name.');
    }
    if (name.trim().length === 0) {
      return reject('Blank is not allowed for playlist name.');
    }

    m
      .request({
        method: 'PUT',
        url: '/user/library',
        data: {
          name: name
        }
      })
      .then(res => {
        args.currentPlaylists(res.playlists);
        resolve(res.id);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function enter(args, elem) {
  $(elem).keyup(e => {
    if (e.keyCode == 13) {
      addPlaylist(args, playlistName());
    }
  });
}

function addPlaylist(args, playlistName) {
  saveAfterConfirm(args, playlistName)
    .then(playlistId => {
      window.location.href = '/discover?playlistId=' + playlistId;
    })
    .catch(err => {
      alert(err);
    });
}

let addNewPlaylist = {
  view: vnode => {
    let args = vnode.attrs;
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
              m('input.form-control[type=text]', {
                placeholder: 'New playlist',
                value: playlistName(),
                onchange: m.withAttr('value', playlistName),
                oncreate: vnode => {
                  enter(args, vnode.dom);
                }
              }),
              m('br'),
              m(
                'button.btn.btn-default#create',
                {
                  'data-dismiss': 'modal',
                  onclick: () => {
                    addPlaylist(args, playlistName());
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
