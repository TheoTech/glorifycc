var playlistDropdownComponent = (function() {
    var addPlaylist = function(name) {
        m.request({
                method: 'PUT',
                url: '/user/library',
                data: {
                    name: name
                }
            })
            .then(function(res) {
                window.location.href = res.url
            })
    }
    var showModal = function(elem) {
        $(elem).change(function() {
            if ($(this).val() == "New Playlist") {
                $('#newPlaylist').modal('show');
            }
        });
    }
    var playlistDropdown = {
        view: function(ctrl, args) {
            return m('div', [
                m('select.selectpicker', {
                    title: 'Choose Your Playlist',
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
                            return m('option', pl.name)
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
                                    onchange: m.withAttr('value', args.playlistName)
                                }),
                                m('br'),
                                m('button.btn.btn-success', {
                                    onclick: function() {
                                        addPlaylist(args.playlistName())
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
