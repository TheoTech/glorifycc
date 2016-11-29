var libraryTableComponent = (function() {
    var songID = m.prop()
    var playlistName = m.prop()
    var addButtonDOM = m.prop()

    var libraryTable = {
        view: function() {
            if (_.isEmpty(songs())) {
                return m('h4', 'Your library is empty')
            } else {
                return [
                    m('table.table', [
                        m('thead', [
                            m('th'),
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
                            songs().map((s) => {
                                s.label = s.label || m.prop('Add to Playlist')
                                s.disabled = s.disabled || m.prop(false)
                                return m('tr', [
                                    m('td', [
                                        m(deleteButtonComponent.deleteButton, {
                                            songID: s._id,
                                            url: '/user/library',
                                            songs: songs,
                                            name: ''
                                        })
                                    ]),
                                    m('td', [
                                        function() {
                                            if (s.copyright === 'private') {
                                                return m('a.btn.btn-default', {
                                                    href: '/song/' + s._id + '/edit'
                                                }, 'Edit')
                                            }
                                        }()
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
                    ]),
                    m(playlistModal.playlistModalComponent, {
                        playlistName: playlistName,
                        addButtonDOM: addButtonDOM,
                        modalName: ''
                    })
                ]
            }
        }
    }

    return {
        init: function(dom) {
            m.mount(dom, libraryTable)
        }
    }
})()
