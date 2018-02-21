'use strict';

import search from './search';
import * as playlist from './playlist';
import library from './library';
import m from 'mithril';

const Application = {
  search,
  playlist,
  library
};

// HACK expose this to the window
window.glorifyApp = Application;

let loadHandlers = [];
document.addEventListener('DOMContentLoaded', function() {
  loadHandlers.forEach(h => {
    h();
  });
});

glorifyApp.initSearchBoxHome = function(elemId) {
  if (!elemId) {
    elemId = 'searchBox';
  }
  loadHandlers.push(() => {
    m.mount(document.getElementById(elemId), search.searchBoxHome);
  });
};

glorifyApp.initSearchPage = function() {
  loadHandlers.push(() => {
    search.searchPage.init(document.getElementById('songlistTable'));
  });
};

glorifyApp.initPlaylistTable = function() {
  loadHandlers.push(() => {
    m.mount(document.getElementById('playlist'), playlist.playlistTable);
    m.mount(
      document.getElementById('addNewPlaylistButton'),
      playlist.addNewPlaylist
    );
  });
};

glorifyApp.initLibraryTable = function() {
  loadHandlers.push(() => {
    m.mount(document.getElementById('library'), library.libraryTable);
  });
};
