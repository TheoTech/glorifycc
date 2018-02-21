'use strict';

import m from 'mithril';
import $ from 'jquery';

function button(args) {
  return m(
    'button.btn.btn-default',
    {
      onclick: function() {
        // HACK isLoggedIn is defined on index.pug
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

const selectPlaylist = {
  view: function(vnode) {
    return button(vnode.attrs);
  }
};

export default selectPlaylist;
