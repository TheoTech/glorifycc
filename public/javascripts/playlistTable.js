var playlistTableComponent = (function() {

    var active = ''
    var playlistTable = {
            view: function() {
                return m('table.table', [
                    m('thead', [
                        m('th', 'Playlist Name')
                    ]),
                    m('tbody', [
                        playlists.map((pl) => {
                            return m('tr', [
                                m('td', [
                                    m('a', {
                                        href: '/user/playlist/' + pl.name
                                    }, pl.name)
                                ])
                            ])
                        })
                    ])
                ])
            }
        }

    return {
        init: function(dom) {
            m.mount(dom, playlistTable)
        }
    }
})()
