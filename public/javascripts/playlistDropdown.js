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
            console.log('hehehe')
            if (e.keyCode === 13) {
                $("#createButton").click()
            }
        })
    }

    var showModal = function(elem) {
        $('#newPlaylist').modal('show');
    }
    var playlistDropdown = {
        view: function(ctrl, args) {
            return m('div', [
                m('.btn-group', [
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
                                onclick: function(elem, isInit, context) {
                                    if (!isInit) {
                                        showModal(elem);
                                    }
                                }
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
                                m('input.form-control[name=playlist type=text]', {
                                    value: 'New Playlist',
                                    onchange: m.withAttr('value', args.playlistName),
                                    config: function(elem, isInit, context) {
                                        if (!isInit) {
                                            enter(elem);
                                        }
                                    }
                                }),
                                m('br'),
                                m('button#createButton.btn.btn-success', {
                                    onclick: function() {
                                        addPlaylist(args.playlistName(), args.url)
                                        $('#newPlaylist').modal('hide')
                                    }
                                }, 'Create')
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
