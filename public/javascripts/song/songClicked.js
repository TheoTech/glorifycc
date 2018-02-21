'use strict';
import m from 'mithril';
import prop from 'mithril/stream';
import { playlistModal } from '../playlist';
import chooseLanguage from './chooseLanguage';
import addOrDeleteButton from '../library/addOrDeleteButton';
import actionButtons from './actionButtons';

function init(leftSong, rightSong, rightSongExists, inLibraryRaw) {
  let inLibrary = prop(inLibraryRaw);
  //this is mithril component for buttons in the song clicked page
  let songPlaylistName = prop();
  let translationPlaylistName = prop();
  let addButtonDOM = prop();

  var mounts = [
    {
      elem: document.getElementById('songPlaylistModal'),
      component: m(playlistModal.playlistModalComponent, {
        playlistName: songPlaylistName,
        addButtonDOM: addButtonDOM
      })
    },
    {
      elem: document.getElementById('groupSong'),
      component: m(actionButtons, {
        songID: leftSong._id,
        addButtonDOM: addButtonDOM,
        playlistName: songPlaylistName,
        playlistModal: playlistModal,
        inLibrary: inLibrary
      })
    },
    {
      elem: document.getElementById('chooseLanguage'),
      component: m(chooseLanguage, {
        rightSongExists
      })
    },
    {
      elem: document.getElementById('leftSongLikeButton'),
      component: m(addOrDeleteButton, {
        songID: leftSong._id,
        url: '/',
        inLibrary: inLibrary,
        className: 'btn-sm'
      })
    }
  ];

  if (rightSong._id) {
    mounts.push({
      elem: document.getElementById('rightSongLikeButton'),
      component: m(addOrDeleteButton, {
        songID: rightSong._id,
        url: '/',
        inLibrary: inLibrary,
        className: 'btn-sm'
      })
    });
  }

  mounts.forEach(function(toMount) {
    m.mount(toMount.elem, {
      view: () => {
        return toMount.component;
      }
    });
  });
}

export default { init };
