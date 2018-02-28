'use strict';
import m from 'mithril';

function deleteSong(id, url, songs, name) {
  //'name' parameter is only for delete button in the playlist page
  // because in this case, we need to know in what playlist the song will be deleted
  m
    .request({
      method: 'DELETE',
      url: url,
      data: {
        id: id,
        name: name
      }
    })
    .then(function(data) {
      songs(data.songs);
    });
}

const deleteButtonComponent = {
  view: function(vnode) {
    let args = vnode.attrs;
    return m(
      'button.btn.btn-default',
      {
        onclick: () => {
          deleteSong(args.songID, args.url, args.songs, args.name);
        }
      },
      [m('i.glyphicon.glyphicon-remove')]
    );
  }
};

export default deleteButtonComponent;
