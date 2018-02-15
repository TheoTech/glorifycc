'use strict';

import search from './search';
import playlist from './playlist';
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

glorifyApp.initSearchBoxHome = function() {
  loadHandlers.push(() => {
    m.mount(document.getElementById('searchBox'), search.searchBoxHome);
  });
};

glorifyApp.initSearchPage = function() {
  loadHandlers.push(() => {
    search.searchPage.init(document.getElementById('songlistTable'));
  });
};
