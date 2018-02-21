'use strict';

import m from 'mithril';
import $ from 'jquery';

const addToPlaylistButton = {
  view: function(vnode) {
    let args = vnode.attrs;
    return m('div', [
      m('input.btn.btn-default[type=button]', {
        value: args.label(),
        disabled: args.disabled(),
        onclick: function() {
          // HACK isLoggedIn set in index.pug
          if (!isLoggedIn) {
            window.location.href = '/user/login';
          } else if (!args.playlistName()) {
            $('#choosePlaylist').modal('show');
            //store the clicked button so we can trigger click it after user picks the playlist
            args.addButtonDOM($(this));
          } else {
            args.playlistModal.addToPlaylist(args);
          }
        }
      })
    ]);
  }
};
export default addToPlaylistButton;
