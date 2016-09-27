var songs = m.prop([])
var playlistName = m.prop()

var pickPlaylist = function(name) {
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
                m('ul.nav.nav-tabs[role=tablist]', [
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

m.mount(document.getElementById('playlist'), playlistTable)
