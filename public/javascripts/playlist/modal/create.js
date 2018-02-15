'use strict';

import m from 'mithril';

export default function createNewPlaylist(args) {
  let enter = function(elem) {
    $(elem).keyup(function(e) {
      if (e.keyCode == 13) {
        $('#create').click();
      }
    });
  };

  return m(
    '.modal.fade[role=dialog]',
    {
      id: 'newPlaylist'
    },
    [
      m('.modal-dialog.modal-sm', [
        m('.modal-content', [
          m('.modal-header', [
            m(
              '.modal-title',
              m('h4', [
                'New Playlist',
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
            )
          ]),
          m('.modal-body', [
            m('label', 'Enter Playlist Name'),
            m('input#newPlaylistInput.form-control[name=playlist type=text]', {
              value: 'New Playlist',
              oninit: vnode => {
                enter(vnode.dom);
              }
            }),
            m('br'),
            m(
              '#info.alert-danger',
              {
                style: {
                  display: 'none'
                }
              },
              'Playlist Exists'
            ),
            m(
              'button#create.btn.btn-default#create',
              {
                onclick: function() {
                  addPlaylist($('input#newPlaylistInput').val(), args);
                }
              },
              'Create'
            )
          ])
        ])
      ])
    ]
  );
}
