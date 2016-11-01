var playlistTableComponent = (function() {
    var active = ''

    var deletePlaylist = function(name) {
        m.request({
            method: 'PUT',
            url: '/user/playlist',
            data: {
                name: name,
                redirect: false
            }
        })
    }

    var playlistTable = {
        view: function() {
            if (_.isEmpty(playlists)) {
                return m('h4', 'You have no playlist')
            } else {
                return m('table.table', [
                    m('thead', [
                        m('th', 'Playlist Name'),
                        m('th')
                    ]),
                    m('tbody', [
                        playlists.map((pl) => {
                            return m('tr', [
                                m('td', [
                                    m('a', {
                                        style: {
                                            'font-size': '1.5em'
                                        },
                                        href: '/user/playlist/' + pl.name
                                    }, pl.name)
                                ]),
                                m('td', [
                                    m('button.btn.btn-default', {
                                        onclick: function() {
                                            deletePlaylist(pl.name)
                                            _.remove(playlists, (n) => n.name === pl.name)
                                        }
                                    }, 'Delete Playlist')
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
            m.mount(dom, playlistTable)
        }
    }
})()
