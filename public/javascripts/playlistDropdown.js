var playlistDropdownComponent = (function() {
    var currentPlaylists = m.prop(playlists)
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

    var enter = function(elem) {
        $(elem).keyup(function(e) {
            if (e.keyCode == 13) {
                $("#create").click()
            }
        })
    }

    var playlistDropdown = {
        view: function(ctrl, args) {
            return m('div', [
                m('#playlistDropdown.btn-group', [
                    m('button.btn.btn-default.dropdown-toggle[type=button]', {
                        'data-toggle': "dropdown",
                        'aria-haspopup': "true",
                        'aria-expanded': "false",
                        style: {
                            border: 0
                        },
                        onclick: function() {
                            //isLoggedIn is defined on the index.jade
                            if (!isLoggedIn) {
                                window.location.href = '/user/login'
                            }
                        }
                    }, args.playlistName() ? 'Selected Playlist: ' + args.playlistName() : 'Select Playlist', [
                        m('span.caret')
                    ]),
                    m('ul.dropdown-menu', [
                        m('li', [
                            m('a', {
                                href: '#',
                                'data-toggle': 'modal',
                                'data-target': '#newPlaylist'
                            }, 'New Playlist')
                        ]),
                        m('li.divider'),
                        currentPlaylists().map((pl) => {
                            return m('li', [
                                m('a', {
                                    href: '#',
                                    onclick: function() {
                                        args.playlistName(pl.name)
                                    }
                                }, pl.name)
                            ])
                        })
                    ])
                ]),
                m('#newPlaylist.modal.fade[role=dialog]', [
                    m('.modal-dialog.modal-sm', [
                        m('.modal-content', [
                            m('.modal-header', [
                                m('h4', 'New Playlist')
                            ]),
                            m('.modal-body', [
                                m('label', 'Enter Playlist Name'),
                                m('input#newPlaylistInput.form-control[name=playlist type=text]', {
                                    value: 'New Playlist',
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
                                        args.playlistName($('input#newPlaylistInput').val())
                                        addPlaylist(args.playlistName(), args.url)
                                        $('#newPlaylist').modal('hide')
                                    }
                                }, 'Create')
                            ])
                        ])
                    ])
                ]),
                m('#choosePlaylist.modal.fade[role=dialog]', [
                    m('.modal-dialog.modal-sm', [
                        m('.modal-content', [
                            m('.modal-header', [
                                m('h4', {
                                    style: {
                                        'margin-left': '40px'
                                    }
                                }, 'Select Playlist', [
                                    m('button#test.btn.btn-default.btn-sm.pull-right', {
                                        'data-toggle': 'tooltip',
                                        'data-placement': 'right',
                                        title: 'Add New Playlist',
                                        config: function(elem, isInit) {
                                            if (!isInit) {
                                                $(elem).tooltip()
                                            }
                                        },
                                        onclick: function() {
                                            $('#choosePlaylist').modal('hide')
                                            $('#newPlaylist').modal('show')
                                        }
                                    }, [
                                        m('span.glyphicon.glyphicon-plus')
                                    ])
                                ])
                            ]),
                            m('.modal-body', [
                                currentPlaylists().map((pl) => {
                                    return [
                                        m('p', [
                                            m('a', {
                                                href: '#',
                                                onclick: function() {
                                                    args.playlistName(pl.name)
                                                },
                                                'data-dismiss': 'modal'
                                            }, pl.name)
                                        ])
                                    ]
                                })
                            ])
                        ])
                    ])
                ])
            ])
        }
    }

    return {
        playlistDropdown: playlistDropdown
    }
})()
