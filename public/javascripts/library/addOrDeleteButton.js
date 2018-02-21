'use strict';

import m from 'mithril';
import { includes } from 'lodash';

function addSong(id, url, inLibrary) {
  m
    .request({
      method: 'POST',
      url: url,
      data: {
        id: id
      }
    })
    .then(function(res) {
      inLibrary(res.inLibrary);
    });
}

function deleteSong(id, url, inLibrary) {
  m
    .request({
      method: 'DELETE',
      url: url,
      data: {
        id: id
      }
    })
    .then(function(res) {
      inLibrary(res.inLibrary);
    });
}

function buttonTitle(args) {
  let isInLibrary = includes(args.inLibrary(), args.songID);
  return isInLibrary ? 'Removing from Favorites...' : 'Adding to Favorites...';
}

function buttonTxt(args) {
  let isInLibrary = includes(args.inLibrary(), args.songID);
  return m(
    isInLibrary
      ? 'i.glyphicon.glyphicon-heart'
      : 'i.glyphicon.glyphicon-heart-empty'
  );
}

function addOrDelete(args) {
  var isInLibrary = includes(args.inLibrary(), args.songID);
  if (isInLibrary) {
    deleteSong(args.songID, args.url, args.inLibrary);
  } else {
    addSong(args.songID, args.url, args.inLibrary);
  }
}

let addOrDeleteButton = {
  view: function(vnode) {
    let args = vnode.attrs;
    return m('div', [
      m(
        'button.btn.btn-default',
        {
          className: args.className,
          title: buttonTitle(args),
          onclick: function() {
            if (!isLoggedIn) {
              window.location.href = '/user/login';
            } else {
              addOrDelete(args);

              //we set the trigger to be manual so we need to
              //manually show and hide the tooltip
              $(this).tooltip('fixTitle');
              $(this).tooltip('show');
              setTimeout(() => {
                $(this).tooltip('hide');
              }, 2000);
            }
          },
          oninit: function(vnode) {
            $(vnode.dom).tooltip({
              trigger: 'manual'
            });
          }
        },
        [buttonTxt(args)]
      ),
      m('p', {
        id: args.songID,
        style: {
          display: 'inline-block',
          'font-style': 'italic',
          'margin-left': '3px'
        }
      })
    ]);
  }
};

export default addOrDeleteButton;
