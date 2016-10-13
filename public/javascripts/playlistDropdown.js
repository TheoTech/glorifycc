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
        $(elem).change(function() {
            if ($(this).val() == "New Playlist") {
                $('#newPlaylist').modal('show');
            }
        });
        $(elem).selectpicker()
    }
    var playlistDropdown = {
        view: function(ctrl, args) {
            return m('div', [
                m('select.selectpicker[multiple]', {
                    title: 'Select Your Playlist',
                    onchange: function() {
                        args.playlistName(this.value)
                        console.log(args.playlistName())
                    },
                    config: function(elem, isInit, context) {
                        if (!isInit) {
                            showModal(elem);
                        }
                    }
                }, [
                    m('optgroup', [
                        m('option', 'New Playlist')
                    ]),
                    m('optgroup', [
                        playlists.map((pl) => {
                            return m('option', {
                              title: 'Selected Playlist: ' + pl.name
                            }, pl.name)
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
