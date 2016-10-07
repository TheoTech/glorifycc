var playlistTableComponent = (function() {
    var songs = m.prop([])
    var playlistName = m.prop()

    var pickPlaylist = function(name) {
        m.request({
                method: 'POST',
                url: '/user/playlist',
                data: {
                    name: name
                }
            })
            .then(function(res) {
                songs(res.songs)
                playlistName(res.name)
            })
    }

    var deletePlaylist = function(name) {
        m.request({
                method: 'PUT',
                url: '/user/playlist',
                data: {
                    name: name
                }
            })
            .then(function(res) {
                window.location.href = res.url
            })
    }

    var active = ''
    var playlistTable = {
        view: function() {
            return [
                m('select.selectpicker', {
                    title: 'Choose Your Playlist',
                    onchange: function() {
                        pickPlaylist(this.value)
                    }
                }, [
                    playlists.map((pl) => {
                        return m('option', pl.name)
                    })
                ]),
                m('table.table', [
                    m('tbody', [
                        songs().map((s) => {
                            return [
                                m('tr', [
                                    m('td', [
                                        m('a', {
                                            href: '/songlist/' + s._id
                                        }, s.title),
                                        m('span', ' by ' + s.author)
                                    ]),
                                    m('td', [
                                      m(deleteButtonComponent.deleteButton, {
                                          songID: s._id,
                                          url: '/user/playlist',
                                          songs: songs,
                                          name: playlistName()
                                      })
                                    ])
                                ]),
                            ]
                        })
                    ])
                ]),
                m('div', [
                    m('a.btn.btn-primary', {
                        href: '/user/playlist/' + playlistName() + '/export1'
                    }, 'Export Playlist'),
                    m('button.btn.btn-default.pull-right', {
                        onclick: function() {
                            deletePlaylist(playlistName())
                        }
                    }, 'Delete Playlist')
                ])
            ]
        }
    }

    return {
        init: function(dom) {
            m.mount(dom, playlistTable)
        }
    }
})()
