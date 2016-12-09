var discover = (function() {
    var inLibrary = m.prop(currentInLibrary);
    var displayedSongs = m.prop(songs);
    var initial = 10;

    //langShown store the language id. it is for showing the songs title in 'langShown'
    var langShown = m.prop('all');

    //langShownLabel stores the language label such as 'English', 'Spanish', etc
    var langShownLabel = m.prop('All Languages');

    //langFilter contains languages for showing the songs that has translations in 'langFilter'
    var langFilter = m.prop([]);

    //the string that the user types in the searchBox
    var searchString = m.prop();
    var addButtonDOM = m.prop();

    var loadMoreAndApplyFilter = function(totalSongsDisplayed, langShown, langFilter, searchString) {
        m.request({
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
            })
    }

    $(window).scroll(function() {
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
            initial += 5;
            loadMoreAndApplyFilter(initial, langShown(), langFilter(), searchString())
        }
    });

    return {
        init: function() {
            m.mount(document.getElementById('discoverBox'), m(searchBoxComponent.searchBox, {
                url: '',
                langShown: langShown,
                langFilter: langFilter,
                loadMoreAndApplyFilter: loadMoreAndApplyFilter,
                initial: initial,
                searchString: searchString,
                langsExist: langsExist
            }))
            m.mount(document.getElementById('songlistTable'), m(songlistTable, {
                langShown: langShown,
                langFilter: langFilter,
                loadMoreAndApplyFilter: loadMoreAndApplyFilter,
                initial: initial,
                displayedSongs: displayedSongs,
                playlistName: playlistName,
                inLibrary: inLibrary,
                langsExist: langsExist,
                searchString: searchString,
                isLoggedIn: isLoggedIn,
                addButtonDOM: addButtonDOM,
                langShownLabel: langShownLabel
            }))
        }
    }
})()
