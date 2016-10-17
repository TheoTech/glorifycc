var songlistTable = {
    view: function(ctrl, args) {
        return [
            m(showSongsIn, {
                langShown: args.langShown,
                langFilter: args.langFilter,
                loadMore: args.loadMore,
                initial: args.initial
            }),
            m('.table-responsive', [
                m('table.table', [
                    m('thead', [
                        m('th', 'Title'),
                        m('th', 'Author'),
                        m('th'),
                        m('th', [
                            m(playlistDropdownComponent.playlistDropdown, {
                                playlistName: args.playlistName,
                                url: '/'
                            })
                        ])
                    ]),
                    m('tbody', [
                        args.displayedSongs().map((s) => {
                            s.label = s.label || m.prop('Add to Playlist');
                            s.disabled = s.disabled || m.prop(false)
                            return m('tr', [
                                m('td', [
                                    m(addOrDeleteButtonComponent.addOrDeleteButton, {
                                        songID: s._id,
                                        text: 'Library',
                                        url: '/',
                                        inLibrary: args.inLibrary
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
                                        playlistName: args.playlistName,
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
        ]
    }
}
