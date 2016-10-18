var playlistDropdownComponent = (function() {
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
                        }
                    }, 'Select Playlist', [
                        m('span.caret')
                    ]),
                    m('ul.dropdown-menu', [
                        m('li', [
                          m('a', {
                              href: '',
                              onclick: function(elem, isInit, context) {
                                  if (!isInit) {
                                      showModal(elem);
                                  }
                              }
                          }, 'New Playlist')
                        ]),
                        m('li.divider'),
                        playlists.map((pl) => {
                            return m('li', [
                              m('a', {
                                  href: '',
                                  onclick: m.withAttr('value', args.playlistName)
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
                                m('input[name=playlist type=text]', {
                                    value: 'New Playlist',
                                    onchange: m.withAttr('value', args.playlistName)
                                }),
                                m('br'),
                                m('button.btn.btn-success', {
                                    onclick: function() {
                                        addPlaylist(args.playlistName(), args.url)
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
