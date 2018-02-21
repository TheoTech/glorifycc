'use strict';

import m from 'mithril';

export default function choosePlaylist(args) {
  return m(
    '.modal.fade[role=dialog]',
    {
      id: 'choosePlaylist'
    },
    [
      m('.modal-dialog.modal-sm', [
        m('.modal-content', [
          m('.modal-header', [
            m('.modal-title', [
              m('h4', [
                'Select Playlist',
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
            m(
              'button.btn.btn-default.btn-sm.pull-right',
              {
                'data-toggle': 'tooltip',
                'data-placement': 'right',
                title: 'Add New Playlist',
                oncreate: vnode => {
                  $(vnode.dom).tooltip();
                },
                onclick: function() {
                  $('#choosePlaylist').modal('hide');
                  $('#newPlaylist').modal('show');
                }
              },
              [m('span.glyphicon.glyphicon-plus')]
            ),
            args.currentPlaylists().map(pl => {
              return [
                m('p', [
                  m(
                    'a',
                    {
                      href: '#',
                      onclick: function() {
                        args.playlistName(pl.name);
                        args.addButtonDOM().trigger('click');
                      },
                      'data-dismiss': 'modal'
                    },
                    pl.name
                  )
                ])
              ];
            })
          ])
        ])
      ])
    ]
  );
}
