var songlistTableComponent = (function() {
    var songID = m.prop()
    var inLibrary = m.prop(currentInLibrary)
    var playlistName = m.prop()

    var songlistTable = {
        view: function() {
            return [
                m('table.table', [
                    m('thead', [
                        m('th', 'Title'),
                        m('th', 'Author'),
                        m('th'),
                        m('th', [
                            m(playlistDropdownComponent.playlistDropdown, {
                                playlistName: playlistName
                            })
                        ])
                    ]),
                    m('tbody', [
                        songs.map((s) => {
                            return m('tr', [
                                m('td', [
                                    m('a', {
                                        href: '/songlist/' + s._id
                                    }, s.title)
                                ]),
                                m('td', s.author),
                                m('td', [
                                    m(addOrDeleteButtonComponent.addOrDeleteButton, {
                                        songID: s._id,
                                        text: 'Library',
                                        url: '/songlist',
                                        inLibrary: inLibrary,
                                    })
                                ]),
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
            m.mount(dom, songlistTable)
        }
    }
})()
