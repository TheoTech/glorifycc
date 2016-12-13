var search = (function() {
    var displayedSongs = m.prop(songs)
    var playlistName = m.prop('')
    var searchString = m.prop('')
    var addButtonDOM = m.prop()
    var enter = function(elem, checkboxClass) {
        $(elem).keyup(function(e) {
            if (e.keyCode == 13) {
                $("#search-button").click()
            }
        })
    }

    var searchResultComponent = {
        view: function() {
            if (displayedSongs().length === 0) {
                return songsNotFound()
            } else {
                return m('div', [
                    m('.table-responsive', [
                        m('table.table', [
                            m('thead', [
                                m('th'),
                                m('th', 'Title'),
                                m('th', 'Author'),
                                m('th.text-center', [
                                    m(selectPlaylist(), {
                                        playlistName: playlistName,
                                        addButtonDOM: addButtonDOM
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
                                                url: '/',
                                                inLibrary: inLibrary
                                            })
                                        ]),
                                        m('td.alignWithTitle', [
                                            m('a', {
                                                href: '/song/' + s._id
                                            }, s.title)
                                        ]),
                                        m('td.alignWithTitle', s.author),
                                        m('td.text-center', [
                                            m(addToPlaylistButton(), {
                                                playlistName: playlistName,
                                                songID: s._id,
                                                label: s.label,
                                                disabled: s.disabled,
                                                addButtonDOM: addButtonDOM,
                                                playlistModal: playlistModal,
                                            })
                                        ])
                                    ])
                                })
                            ])
                        ])
                    ]),
                    m(playlistModal.playlistModalComponent, {
                        playlistName: playlistName,
                        addButtonDOM: addButtonDOM,
                    })
                ])
            }
        }
    }

    return {
        init: function(dom) {
            m.mount(dom, searchResultComponent)
        }
    }
})()
