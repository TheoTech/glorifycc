'use strict';

import m from 'mithril';
import prop from 'mithril/stream';
import showSongsIn from './showSongsIn';
import { songsNotFound } from '../search';
import { addToPlaylistButton, selectPlaylist } from '../playlist';
import { addOrDeleteButton } from '../library';

const songlistTable = {
  view: function(vnode) {
    let args = vnode.attrs;
    if (args.displayedSongs().length === 0) {
      return songsNotFound;
    } else {
      return [
        m(showSongsIn, {
          langShown: args.langShown,
          langFilter: args.langFilter,
          loadMoreAndApplyFilter: args.loadMoreAndApplyFilter,
          initial: args.initial,
          langsExist: args.langsExist,
          searchString: args.searchString,
          langShownLabel: args.langShownLabel
        }),
        m('.table-responsive', [
          m('table.table', [
            m('thead', [
              m('th'),
              m('th', 'Title'),
              m('th', 'Author'),
              m('th.text-center', [
                m(selectPlaylist, {
                  playlistName: args.playlistName,
                  addButtonDOM: args.addButtonDOM
                })
              ])
            ]),
            m('tbody', [
              args.displayedSongs().map(s => {
                s.label = s.label || prop('Add to Playlist');
                s.disabled = s.disabled || prop(false);
                return m('tr', [
                  m('td', [
                    m(addOrDeleteButton, {
                      songID: s._id,
                      text: 'Library',
                      url: '/',
                      inLibrary: args.inLibrary
                    })
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
                      playlistName: args.playlistName,
                      songID: s._id,
                      label: s.label,
                      disabled: s.disabled,
                      addButtonDOM: args.addButtonDOM,
                      playlistModal: playlistModal
                    })
                  ])
                ]);
              })
            ])
          ])
        ]),
        m(playlistModal.playlistModalComponent, {
          playlistName: args.playlistName,
          addButtonDOM: args.addButtonDOM
        })
      ];
    }
  }
};

export default songlistTable;
