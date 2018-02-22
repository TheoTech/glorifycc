'use strict';

import m from 'mithril';
import prop from 'mithril/stream';
import { isEmpty } from 'lodash';
import {
  selectPlaylist,
  deleteButton,
  addToPlaylistButton,
  playlistModal
} from '../playlist';

let songID = prop();
let playlistName = prop();
let addButtonDOM = prop();
let songs = prop();

const libraryTable = {
  view: () => {
    if (isEmpty(songs())) {
      return m('h4', 'Your library of favorites is empty.');
    } else {
      return [
        m('table.table', [
          m('thead', [
            m('th'),
            m('th'),
            m('th', 'Title'),
            m('th', 'Author'),
            m('th.text-center', [
              m(selectPlaylist, {
                playlistName: playlistName,
                addButtonDOM: addButtonDOM
              })
            ])
          ]),
          m('tbody', [
            songs().map(s => {
              s.label = s.label || prop('Add to Playlist');
              s.disabled = s.disabled || prop(false);
              return m('tr', [
                m('td', [
                  m(deleteButton, {
                    songID: s._id,
                    url: '/user/library',
                    songs: songs,
                    name: ''
                  })
                ]),
                m('td', [
                  (function() {
                    if (s.copyright === 'private') {
                      return m(
                        'a.btn.btn-default',
                        {
                          href: '/song/' + s._id + '/edit'
                        },
                        'Edit'
                      );
                    }
                  })()
                ]),
                m('td.alignWithTitle', [
                  m(
                    'a',
                    {
                      href: '/song/' + s._id
                    },
                    s.title
                  )
                ]),
                m('td.alignWithTitle', s.author),
                m('td.text-center', [
                  m(addToPlaylistButton, {
                    playlistName: playlistName,
                    songID: s._id,
                    label: s.label,
                    disabled: s.disabled,
                    addButtonDOM: addButtonDOM,
                    playlistModal: playlistModal,
                    modalName: ''
                  })
                ])
              ]);
            })
          ])
        ]),
        m(playlistModal.playlistModalComponent, {
          playlistName: playlistName,
          addButtonDOM: addButtonDOM,
          modalName: ''
        })
      ];
    }
  }
};

export default libraryTable;
