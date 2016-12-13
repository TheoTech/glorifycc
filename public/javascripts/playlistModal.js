var playlistModal = (function() {
    var currentPlaylists = m.prop(playlists)
    var addPlaylist = function(name, args) {
        m.request({
                method: 'PUT',
                url: '/user/library',
                data: {
                    name: name
                }
            })
            .then(function(res) {
                if (res.playlistExists) {
                    $('#info').show()
                        .delay(2000)
                        .fadeOut()
                } else {
                    currentPlaylists(res.playlists)
                    args.playlistName(name)
                    //hide it once it is finished adding playlist
                    $('#newPlaylist').modal('hide')
                    args.addButtonDOM().trigger('click')
                }
            })
    }

    var addToPlaylist = (args) => {
        m.request({
                method: 'POST',
                url: '/user/library',
                data: {
                    name: args.playlistName(),
                    id: args.songID
                }
            })
            .then((res) => {
                args.label('Added to ' + args.playlistName());
                args.disabled(true);
                setTimeout(() => {
                    args.label('Add to Playlist');
                    args.disabled(false);
                    m.redraw()
                }, 3000);
            })
    }

    var enter = function(elem) {
        $(elem).keyup(function(e) {
            if (e.keyCode == 13) {
                $("#create").click()
            }
        })
    }

    function createNewPlaylist(args) {
        return m('.modal.fade[role=dialog]', {
            id: 'newPlaylist'
        }, [
            m('.modal-dialog.modal-sm', [
                m('.modal-content', [
                    m('.modal-header', [
                        m('.modal-title', m('h4', [
                            'New Playlist',
                            m('button.close[data-dismiss="modal"]', {
                              style: {
                                color: 'white'
                              }
                            }, [
                              m('span', m.trust('&times;'))
                            ])
                        ])),
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
                        m('#info.alert-danger', {
                            style: {
                                display: 'none'
                            }
                        }, 'Playlist Exists'),
                        m('button#create.btn.btn-default#create', {
                            onclick: function() {
                                addPlaylist($('input#newPlaylistInput').val(), args);
                            }
                        }, 'Create')
                    ])
                ])
            ])
        ])
    }

    function choosePlaylist(args) {
        return m('.modal.fade[role=dialog]', {
            id: 'choosePlaylist'
        }, [
            m('.modal-dialog.modal-sm', [
                m('.modal-content', [
                    m('.modal-header', [
                        m('.modal-title', [
                            m('h4', [
                                'Select Playlist',
                                m('button.close[data-dismiss="modal"]', {
                                  style: {
                                    color: 'white'
                                  }
                                }, [
                                  m('span', m.trust('&times;'))
                                ])
                            ])
                        ])
                    ]),
                    m('.modal-body', [
                        m('button.btn.btn-default.btn-sm.pull-right', {
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
                        ]),
                        currentPlaylists().map((pl) => {
                            return [
                                m('p', [
                                    m('a', {
                                        href: '#',
                                        onclick: function() {
                                            args.playlistName(pl.name)
                                            console.log()
                                            args.addButtonDOM().trigger('click')
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
    }

    var playlistModalComponent = {
        view: function(ctrl, args) {
            return m('div', [
                choosePlaylist(args),
                createNewPlaylist(args)
            ])
        }
    }

    return {
        playlistModalComponent: playlistModalComponent,
        addToPlaylist: addToPlaylist
    }
})()
