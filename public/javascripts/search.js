var search = (function() {
    //
    // songs: songs,
    // inLibrary: [],
    // playlists: [],
    // messages: messages,
    // langsExist: langsExist,
    // isLoggedIn: false
    //     var inLibrary = m.prop(currentInLibrary)
    //     var playlistName = m.prop()
    //     var displayedSongs = m.prop(songs)
    //     var initial = 10
    //     var langShown = m.prop('all')
    //     var langFilter = m.prop([])
    //     var searchString = m.prop()

    var displayedSongs = m.prop(songs)
    var playlistName = m.prop()
    var inLibrary = m.prop(currentInLibrary)
    var searchString = m.prop('')
    var enter = function(elem, checkboxClass) {
        $(elem).keyup(function(e) {
            if (e.keyCode == 13) {
                $("#search-button").click()
            }
        })
    }

    var searchBoxComponent = {
        view: function(ctrl, args) {
            return m('#searchInput.input-group', [
                m('input.form-control[type=text]', {
                    placeholder: 'Title, Lyric or Author',
                    onchange: m.withAttr('value', searchString),
                    config: function(elem, isInit, context) {
                        if (!isInit) {
                            enter(elem);
                        }
                    }
                }),
                m('span.input-group-btn', [
                    m('button#search-button.btn.btn-success', {
                        onclick: function() {
                            window.location.href = '/search?q=' + searchString()
                        }
                    }, [
                        m('i.glyphicon.glyphicon-search')
                    ])
                ])
            ])
        }
    }


    var searchResultComponent = {
        view: function() {
            if (displayedSongs().length === 0) {
                return m('h4', {
                        style: {'margin-top': '35px'}
                    }, 'Songs not found')
            } else {
                return m('.table-responsive', [
                    m('table.table', [
                        m('thead', [
                            m('th'),
                            m('th', 'Title'),
                            m('th', 'Author'),
                            m('th', [
                                m(playlistDropdownComponent.playlistDropdown, {
                                    playlistName: playlistName,
                                    url: '/',
                                    isLoggedIn: isLoggedIn
                                })
                            ])
                        ]),
                        m('tbody', [
                            displayedSongs().map((s) => {
                                s.label = s.label || m.prop('Add to Playlist');
                                s.disabled = s.disabled || m.prop(false)
                                return m('tr', [
                                    m('td', [
                                        m(addOrDeleteButtonComponent.addOrDeleteButton, {
                                            songID: s._id,
                                            text: 'Library',
                                            url: '/',
                                            inLibrary: inLibrary
                                        })
                                    ]),
                                    m('td', [
                                        m('a', {
                                            href: '/' + s._id
                                        }, s.title)
                                    ]),
                                    m('td', s.author),
                                    m('td', [
                                        m(addToPlaylistButton, {
                                            playlistName: playlistName,
                                            songID: s._id,
                                            url: '/',
                                            key: s._id,
                                            label: s.label,
                                            disabled: s.disabled
                                        })
                                    ])
                                ])
                            })
                        ])
                    ])
                ])
            }
        }
    }

    return {
        init: function() {
            m.mount(document.getElementById('searchBox'), searchBoxComponent)
            m.mount(document.getElementById('songlistTable'), searchResultComponent)
        }
    }
})()
