var discover = (function() {
    var inLibrary = m.prop(currentInLibrary)
    var displayedSongs = m.prop(songs)
    var initial = 10
    var langShown = m.prop('all')
    var langFilter = m.prop([])
    var searchString = m.prop()
    var addButtonDOM = m.prop()

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
                displayedSongs(res.songs)
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
                addButtonDOM: addButtonDOM
            }))
        }
    }
})()
