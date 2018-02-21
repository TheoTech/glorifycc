'use strict';

import m from 'mithril';
import prop from 'mithril/stream';
import $ from 'jquery';

//this is mithril component for buttons in the song clicked page
const actionButtons = {
  view: function(vnode) {
    let args = vnode.attrs;
    if (!args.label || !args.disabled) {
      args.label = prop('Add to Playlist');
      args.disabled = prop(false);
    }
    return [
      m(
        'button.btn.btn-success',
        {
          disabled: args.disabled(),
          onclick: function() {
            if (!isLoggedIn) {
              window.location.href = '/user/login';
            } else if (!args.playlistName()) {
              $('#choosePlaylist').modal('show');
              args.addButtonDOM($(this));
            } else {
              args.playlistModal.addToPlaylist(args);
            }
          }
        },
        args.label()
      ),
      m.trust('&nbsp;'),
      m(
        'button.btn.btn-default',
        {
          onclick: function() {
            window.location.href = args.songID + '/add-translation';
          }
        },
        'Add Translation'
      )
    ];
  }
};

export default actionButtons;
