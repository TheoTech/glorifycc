var songClicked = (function() {
    var translation = [];
    console.log(JSON.stringify(song))
    var selectTranslation = function(lang) {
        m.request({
                method: 'PUT',
                url: '/' + song._id,
                data: {
                    lang: lang
                }
            })
            .then(function(res) {
                translation = res.translation
            })
    }

    var songClickedComponent = {
        view: function() {
            return m('.row', [
                m('.col-xs-6', [
                    m('h1', song.title),
                    m('h3', 'by ' + song.author),
                    m('p', song.translator ? 'Translated by ' + song.translatorm : ''),
                    m('p', song.contributor ? 'Contributor: ' + song.contributor : ''),
                    m('p', song.copyright ? 'Copyright: ' + song.copyright : '')
                ]),
                function(){
                    if(translation){
                      return m('p', 'hehehe')
                    }
                }(),
                // rightTranslation ? m('.col-xs-6', [
                //     m('h1', translation.title),
                //     m('h3', translation.author),
                //     m('p', translation.translator),
                //     m('p', translation.contributor),
                //     m('p', translation.copyright)
                // ]), : m('span'),
                m('br'),
                m('br'),
                m('.row', [
                    m('.col-xs-offset-6.col-xs-6', [
                        m('.form-group', [
                            m('label', 'Language'),
                            m('select.form-control', {
                                onchange: function() {
                                    selectTranslation(this.value)
                                }
                            }, [
                                m('option', 'Select Translation')
                            ])
                        ])
                    ])
                ]),
                m('.row', [
                    m('.col-xs-6', [
                        m('h4.capitalize', song.lang),
                        song.lyric.map((line) => {
                            return line === '' ? m('br') : [
                                m('span', 'line'),
                                m('br')
                            ]
                        })
                    ])
                    // m('.col-xs-6', [
                    //     m('h4.capitalize', translation.lang),
                    //     translation.lyric.map((line) => {
                    //         return line === '' ? m('br') : [
                    //             m('span', 'line'),
                    //             m('br')
                    //         ]
                    //     })
                    // ])
                ])
            ])
        }
    }
    return {
      init: function(dom){
        m.mount(dom, songClickedComponent)
      }
    }
})();


//this is mithril component for buttons in the song clicked page
var songPageButtonsComponent = (function() {
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
    // console.log(playlists)
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
                        $('#playlistList').modal('show');
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
