var songs = m.prop([])
var playlistName = m.prop()

var pickPlaylist = function(name) {
    // console.log(id)
    m.request({
            method: 'POST',
            url: '/user/playlist',
            data: {
                name: name
            }
        })
        .then(function(res) {
            console.log(JSON.stringify(res))
            songs(res.songs)
            playlistName(res.name)
        })
}



var showtab = function(elem) {
    $(elem.click(function() {
        $(this).tab('show')
    }))
}


window.onload = function(){
  if (document.getElementById('0')){
    document.getElementById('0').click();
  }
};

var active = ''
var playlistTable = {
        view: function() {
            return [
                // m('#info.alert[style=display:none]', {class: infoStatus()}, info()),
                // m('#fail.alert.alert-danger[style=display:none]', info()),
                m('ul.nav.nav-tabs[role=tablist]', [
                    // m.component(onloadActiveTab)
                    playlists.map((playlist, i, arr) => {
                        active = i == 0 ? 'active' : ''
                        return m('li', {
                            class: active,
                            onclick: function() {
                                pickPlaylist(playlist.name)
                            },
                            config: function(elem, isInit, context) {
                                if (!isInit) {
                                    showtab(elem);
                                }
                            }
                        }, [
                            m('a', {
                                id: i,
                                'data-toggle': 'tab'
                            }, playlist.name)
                        ])
                    })
                ]),
                m('.tab-content', [
                    m('table.table', [
                        m('tbody', [
                            songs().map((s) => {
                                return m('tr', [
                                    m('td', s.title + ' by ' + s.author)
                                ])
                            })
                        ])
                    ])

                ]),
                m('a.btn.btn-primary', {href: '/user/playlist/' + playlistName() + '/export1'}, 'Export Playlist')
            ]
        }
    }
    // m('table.table', [
    //     m('thead', [
    //         m('th', 'Title'),
    //         m('th', 'Author'),
    //         m('th')
    //     ]),
    //     m('tbody', [
    //         songs.map((s) => {
    //             // console.log(JSON.stringify(s))
    //             return m('tr', [
    //                 m('td', s.title),
    //                 m('td', s.author),
    //                 m('td', [
    //                     m('button.btn.btn-warning', {
    //                         onclick: function() {
    //                             songID(s._id)
    //                         },
    //                         'data-toggle': 'modal',
    //                         'data-target': '#existingPlaylist'
    //
    //                     }, 'Add to Playlist')
    //                 ])
    //             ])
    //         })
    //     ])
    // ])
m.mount(document.getElementById('playlist'), playlistTable)
