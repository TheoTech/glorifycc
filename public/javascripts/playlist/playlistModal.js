'use strict';
import m from 'mithril';
import prop from 'mithril/stream';
import choosePlaylist from './modal/choose';
import createNewPlaylist from './modal/create';

let playlists = [];
// HACK
if (window.playlistRaw) {
  playlists = playlistRaw;
}
let currentPlaylists = prop(playlists);

let playlistModalComponent = {
  view: function(vnode) {
    let args = { ...vnode.attrs, currentPlaylists };
    return m('div', [choosePlaylist(args), createNewPlaylist(args)]);
  }
};

let addPlaylist = function(name, args) {
  m
    .request({
      method: 'PUT',
      url: '/user/library',
      data: {
        name: name
      }
    })
    .then(function(res) {
      if (res.playlistExists) {
        $('#info')
          .show()
          .delay(2000)
          .fadeOut();
      } else {
        currentPlaylists(res.playlists);
        args.playlistName(name);
        //hide it once it is finished adding playlist
        $('#newPlaylist').modal('hide');
        args.addButtonDOM().trigger('click');
      }
    });
};

let addToPlaylist = args => {
  m
    .request({
      method: 'POST',
      url: '/user/library',
      data: {
        name: args.playlistName(),
        id: args.songID
      }
    })
    .then(res => {
      args.label('Added to ' + args.playlistName());
      args.disabled(true);
      setTimeout(() => {
        args.label('Add to Playlist');
        args.disabled(false);
        m.redraw();
      }, 3000);
    });
};

export default { playlistModalComponent, addToPlaylist };
