var songlistTable = {
    view: function(ctrl, args) {
        if (args.displayedSongs().length === 0) {
            return m('h4', {
                style: {
                    'margin-top': '35px'
                }
            }, 'Songs not found')
        } else {
            return [
                m(showSongsIn, {
                    langShown: args.langShown,
                    langFilter: args.langFilter,
                    loadMoreAndApplyFilter: args.loadMoreAndApplyFilter,
                    initial: args.initial,
                    langsExist: args.langsExist,
                    searchString: args.searchString
                }),
                m('.table-responsive', [
                    m('table.table', [
                        m('thead', [
                            m('th'),
                            m('th', 'Title'),
                            m('th', 'Author'),
                            m('th.text-center', [
                                m(selectPlaylist(), {
                                    playlistName: args.playlistName,
                                    addButtonDOM: args.addButtonDOM
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
                                    m('td.alignWithTitle', [
                                        m('a', {
                                            href: '/song/' + s._id
                                        }, s.title)
                                    ]),
                                    m('td.alignWithTitle', s.author),
                                    m('td.text-center', [
                                        m(addToPlaylistButton(), {
                                            playlistName: args.playlistName,
                                            songID: s._id,
                                            label: s.label,
                                            disabled: s.disabled,
                                            addButtonDOM: args.addButtonDOM,
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
                    playlistName: args.playlistName,
                    addButtonDOM: args.addButtonDOM,
                    modalName: ''
                })
            ]
        }
    }
}
