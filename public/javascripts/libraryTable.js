var libraryTableComponent = (function() {
    var songID = m.prop()
    var playlistName = m.prop()
    var songs = m.prop(s)

    var libraryTable = {
        view: function() {
            return [
                m('table.table', [
                    m('thead', [
                        m('th'),
                        m('th', 'Title'),
                        m('th', 'Author'),
                        m('th', [
                            m(playlistDropdownComponent.playlistDropdown, {
                                playlistName: playlistName
                            })
                        ])
                    ]),
                    m('tbody', [
                        songs().map((s) => {
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
                                    m('a', {
                                        href: '/songlist/' + s._id
                                    }, s.title)
                                ]),
                                m('td', s.author),
                                m('td', [
                                    m(addToPlaylistButtonComponent.addToPlaylistButton, {
                                        playlistName: playlistName,
                                        songID: s._id
                                    })
                                ])
                            ])
                        })
                    ])
                ])
            ]
        }
    }

    return {
        init: function(dom) {
            m.mount(dom, libraryTable)
        }
    }
})()
