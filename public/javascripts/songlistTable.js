var songlistTableComponent = (function() {
    var songID = m.prop()
    var inLibrary = m.prop(currentInLibrary)
    var playlistName = m.prop()
    var displayedSongs = m.prop(songs)
    var initial = 5
    var langShown = languageFilterComponent.langShown

    var loadMore = function(amount, langShown) {
        m.request({
                method: 'PUT',
                url: '/',
                data: {amount: amount, langShown: langShown}
            })
            .then(function(res) {
                displayedSongs(res.songs)
            })
    }

    var songlistTable = {
        view: function() {
            return [
                m(languageFilterComponent.languageFilter, {songs: displayedSongs}),
                m('.table-responsive', [
                    m('table.table', [
                        m('thead', [
                            m('th', 'Title'),
                            m('th', 'Author'),
                            m('th'),
                            m('th', [
                                m(playlistDropdownComponent.playlistDropdown, {
                                    playlistName: playlistName,
                                    url: '/'
                                })
                            ])
                        ]),
                        m('tbody', [
                            displayedSongs().map((s) => {
                                s.label = s.label || m.prop('Add to Playlist');
                                s.disabled = s.disabled || m.prop(false)
                                return m('tr', [
                                    m('td', [
                                        m('a', {
                                            href: '/' + s._id
                                        }, s.title)
                                    ]),
                                    m('td', s.author),
                                    m('td', [
                                        m(addOrDeleteButtonComponent.addOrDeleteButton, {
                                            songID: s._id,
                                            text: 'Library',
                                            url: '/',
                                            inLibrary: inLibrary,
                                        })
                                    ]),
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
            ]
        }
    }

    $(window).scroll(function()
    {
        if($(window).scrollTop() == $(document).height() - $(window).height())
        {
            initial += 5;
            loadMore(initial, langShown())
        }
    });

    return {
        init: function(dom) {
            m.mount(dom, songlistTable)
        }
    }
})()
