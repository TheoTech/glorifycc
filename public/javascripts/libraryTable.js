var libraryTableComponent = (function() {
    var songID = m.prop()
    var playlistName = m.prop()
    var songs = m.prop(s)
    console.log(songs())

    var libraryTable = {
        view: function() {
            if (_.isEmpty(songs())) {
                return m('h4', 'Your library is empty')
            } else {
                return m('table.table', [
                    m('thead', [
                        m('th'),
                        m('th'),
                        m('th', 'Title'),
                        m('th', 'Author'),
                        m('th', [
                            m(playlistDropdownComponent.playlistDropdown, {
                                playlistName: playlistName,
                                url: '/user/library'
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
                                        if (s.private) {
                                            return m('a.btn.btn-default', {
                                                href: 'privatesong/' + s._id + '/edit'
                                            }, 'Edit')
                                        }
                                    }()
                                ]),
                                m('td', [
                                    function() {
                                        if (s.private) {
                                            return m('a', {
                                                href: '/user/privatesong/' + s._id
                                            }, s.title)
                                        } else {
                                            return m('a', {
                                                href: '/song/' + s._id
                                            }, s.title)
                                        }
                                    }()
                                ]),
                                m('td', s.author),
                                m('td', [
                                    m(addToPlaylistButton, {
                                        playlistName: playlistName,
                                        songID: s._id,
                                        url: '/user/library',
                                        key: s._id,
                                        label: s.label,
                                        disabled: s.disabled
                                    })
                                ])
                            ])
                        })
                    ])
                ])
            }
        }
    }

    return {
        init: function(dom) {
            m.mount(dom, libraryTable)
        }
    }
})()
