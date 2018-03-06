'use strict';

import m from 'mithril';
import $ from 'jquery';
import prop from 'mithril/stream';
import { find } from 'lodash';
import { searchBox } from './search';
import { songlistTable } from './song';

let inLibrary = prop();
let displayedSongs = prop([]);
let numberOfSongsToShow = 20;

//langShown store the language id. it is for showing the songs title in 'langShown'
let langShown = prop('all');

//langShownLabel stores the language label such as 'English', 'Spanish', etc
let langShownLabel = prop('All Languages');

//langFilter contains languages for showing the songs that has translations in 'langFilter'
let langFilter = prop([]);

//the string that the user types in the searchBox
let searchString = prop();
let addButtonDOM = prop();

let loadMoreAndApplyFilter = function(
  totalSongsDisplayed,
  langShown,
  langFilter,
  searchString
)
{
  m
    .request({
      method: 'PUT',
      url: '/discover',
      data: {
        totalSongsDisplayed: totalSongsDisplayed,
        langShown: langShown,
        langFilter: langFilter,
        searchString: searchString
      }
    })
    .then(function(res) {
      displayedSongs(res.songs);
    });
};

$(window).scroll(function() {
  if ($(window).scrollTop() == $(document).height() - $(window).height()) {
    numberOfSongsToShow += 10;
    loadMoreAndApplyFilter(
      numberOfSongsToShow,
      langShown(),
      langFilter(),
      searchString()
    );
  }
});

function init(opts) {
  let selectedPlaylistId = opts.selectedPlaylistId;
  inLibrary(opts.currentInLibrary);
  displayedSongs(opts.songs);
  let { playlists, isLoggedIn, langsExist } = opts;
  let selectedPlaylist = find(playlists, { _id: selectedPlaylistId });
  let playlistName = selectedPlaylist ? prop(selectedPlaylist.name) : prop('');
  m.mount(document.getElementById('discoverBox'), {
    view: () => {
      return m(searchBox, {
        url: '',
        langShown: langShown,
        langFilter: langFilter,
        loadMoreAndApplyFilter: loadMoreAndApplyFilter,
        initial: numberOfSongsToShow,
        searchString: searchString,
        langsExist: langsExist
      });
    }
  });

  m.mount(document.getElementById('songlistTable'), {
    view: () => {
      return m(songlistTable, {
        langShown,
        langFilter,
        loadMoreAndApplyFilter,
        initial: numberOfSongsToShow,
        displayedSongs,
        playlists,
        playlistName,
        inLibrary,
        langsExist,
        searchString,
        isLoggedIn,
        addButtonDOM,
        langShownLabel
      });
    }
  });
}

export default {
  init
};
