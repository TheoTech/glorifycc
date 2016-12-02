var playlistClickedComponent = (function() {
    //Note: var playlistName, var songs are defined on playlistClicked.jade
    var deletePlaylist = function(name) {
        m.request({
                method: 'PUT',
                url: '/user/playlist',
                data: {
                    name: name,
                    redirect: true
                }
            })
            .then(function(res) {
                window.location.href = res.url
            })
    }
    var playlistClicked = {
        view: function() {
            return [
                m('h1', playlistName()),
                m('table.table', [
                    m('tbody', [
                        songs().map((s) => {
                            return [
                                m('tr', [
                                    m('td', [
                                        m('a', {
                                            href: '/song/' + s._id
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
                        href: '/user/playlist/' + encodeURIComponent(playlistName()) + '/export1'
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
        playlistClicked: playlistClicked
    }
})()
