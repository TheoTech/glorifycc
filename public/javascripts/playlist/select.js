'use strict';

import m from 'mithril';

function button(args) {
  return m(
    'button.btn.btn-default',
    {
      onclick: function() {
        //isLoggedIn is defined on the index.pug
        if (!isLoggedIn) {
          window.location.href = '/user/login';
        } else {
          $('#choosePlaylist').modal('show');
          args.addButtonDOM($(this));
        }
      }
    },
    args.playlistName()
      ? 'Selected Playlist: ' + args.playlistName()
      : 'Select Playlist'
  );
}

export default function selectPlaylist() {
  return {
    view: function(vnode) {
      return button(vnode.attrs);
    }
  };
}
