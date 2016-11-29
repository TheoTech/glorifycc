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
                return m('h4', {
                    style: {
                        'margin-top': '35px'
                    }
                }, 'Songs not found')
            } else {
                return m('div', [
                    m('.table-responsive', [
                        m('table.table', [
                            m('thead', [
                                m('th'),
                                m('th', 'Title'),
                                m('th', 'Author'),
                                m('th', [
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
                                        m('td', [
                                            m('a', {
                                                href: '/song/' + s._id
                                            }, s.title)
                                        ]),
                                        m('td', s.author),
                                        m('td', [
                                            m(addToPlaylistButton(), {
                                                playlistName: playlistName,
                                                songID: s._id,
                                                label: s.label,
                                                disabled: s.disabled,
                                                addButtonDOM: addButtonDOM,
                                                playlistModal: playlistModal,
                                                modalName: ''
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
                        modalName: ''
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
