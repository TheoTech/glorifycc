var playlistTableComponent = (function() {
    var playlistName = m.prop('New Playlist')

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

    var enter = function(elem) {
        $(elem).keyup(function(e) {
            if (e.keyCode == 13) {
                $("#create").click()
            }
        })
    }

    var addPlaylist = function(name, url) {
        m.request({
                method: 'PUT',
                url: '/user/library',
                data: {
                    name: name,
                    url: url
                }
            })
            .then(function(res) {
                if (res.url) {
                    window.location.href = res.url
                } else {
                    currentPlaylists(res.playlists)
                }
            })
    }

    var addNewPlaylist = {
        view: function() {
            return [
                m('button.btn.btn-default', {
                    'data-toggle': 'modal',
                    'data-target': '#newPlaylist'
                }, [
                    m('i.glyphicon.glyphicon-plus')
                ], ' Add New Playlist'),
                m('#newPlaylist.modal.fade[role=dialog]', [
                    m('.modal-dialog.modal-sm', [
                        m('.modal-content', [
                            m('.modal-header', [
                                m('h4', 'New Playlist')
                            ]),
                            m('.modal-body', [
                                m('label', 'Enter Playlist Name'),
                                m('input.form-control[name=playlist type=text]', {
                                    value: playlistName(),
                                    onchange: m.withAttr('value', playlistName),
                                    config: function(elem, isInit) {
                                        if (!isInit) {
                                            enter(elem)
                                        }
                                    }
                                }),
                                m('br'),
                                m('button.btn.btn-default#create', {
                                    "data-dismiss": "modal",
                                    onclick: function() {
                                        addPlaylist(playlistName())
                                        window.location.href = '/discover?playlist=' + playlistName()
                                    }
                                }, 'Create')
                            ])
                        ])
                    ])
                ])
            ]
        }
    }

    var playlistTable = {
        view: function() {
            if (_.isEmpty(playlists)) {
                return m('h4', 'You have no playlist')
            } else {
                return m('table.table', [
                    m('thead', [
                        m('th', {
                            style: {
                                'font-size': '18px'
                            }
                        }, 'Playlist Name')
                        // m('')
                    ]),
                    m('tbody', [
                        playlists.map((pl) => {
                            return m('tr', [
                                m('td', [
                                    m('a', {
                                        href: '/user/playlist/' + pl.name
                                    }, pl.name)
                                ]),
                                m('td', [
                                    m('button.btn.btn-default.pull-right', {
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
        playlistTable: playlistTable,
        addNewPlaylist: addNewPlaylist
    }
})()
