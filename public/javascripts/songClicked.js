//this is mithril component for buttons in the song clicked page
var songClicked = (function() {
    var addToPlaylist = function(name, songID) {
        m.request({
            method: 'POST',
            url: '/user/library',
            data: {
                name: name,
                id: songID,
                url: url
            }
        })
    };

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

    var playlistName = m.prop();
    var buttons = {
        view: function(ctrl, args) {
            return [
                m(addOrDeleteButtonComponent.addOrDeleteButton, {
                    songID: args._id,
                    text: 'Library',
                    url: '/',
                    inLibrary: inLibrary,
                }),
                m('br'),
                m('button.btn.btn-default', {
                    onclick: function() {
                        if (isLoggedIn) {
                            $('#playlistList').modal('show');
                        } else {
                            window.location.href = '/user/login'
                        }
                    }
                }, 'Add to Playlist'),
                m('#playlistList.modal.fade[role=dialog]', [
                    m('.modal-dialog.modal-sm', [
                        m('.modal-content', [
                            m('.modal-header', [
                                m('button.btn.btn-default.pull-right', {
                                    onclick: function() {
                                        $('#newPlaylist').modal('show');
                                    }
                                }, [
                                    m('i.glyphicon.glyphicon-plus')
                                ]),
                                m('h4', 'Playlist')
                            ]),
                            m('.modal-body', [
                                playlists.map((pl) => {
                                    return m('p', [
                                        m('a', {
                                            href: '',
                                            onclick: function() {
                                                addToPlaylist(pl.name, args._id)
                                            }
                                        }, pl.name)
                                    ])
                                })
                            ])
                        ])
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
                                    onchange: m.withAttr('value', playlistName)
                                }),
                                m('br'),
                                m('button.btn.btn-success', {
                                    onclick: function() {
                                        addPlaylist(playlistName(), url)
                                    }
                                }, 'Create')
                            ])
                        ])
                    ])
                ])
            ]
        }
    }

    return {
        buttons: buttons
    }
})()
