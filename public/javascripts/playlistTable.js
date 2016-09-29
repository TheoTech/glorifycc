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
            songs(res.songs)
            playlistName(res.name)
        })
}

var deleteSong = function(id, name) {
    m.request({
            method: 'DELETE',
            url: '/user/playlist',
            data: {
                id: id,
                name: name
            }
        })
        .then(function(res) {
            songs(res.songs)
        })
};

var deletePlaylist = function(name){
  m.request({
    method: 'PUT',
    url: '/user/playlist',
    data: {
      name: name
    }
  })
  .then(function(res){
        window.location.href = res.url
  })
}

var active = ''
var playlistTable = {
    view: function() {
        return [
            m('select.selectpicker', {
                title: 'Choose Your Playlist',
                onchange: function() {
                    pickPlaylist(this.value)
                }
            }, [
                playlists.map((pl) => {
                    return m('option', pl.name)
                })
            ]),
            m('table.table', [
                m('tbody', [
                    songs().map((s) => {
                        return [
                            m('tr', [
                                m('td', s.title + ' by ' + s.author),
                                m('td', [
                                  m('button.btn.btn-danger.pull-right', {
                                    onclick: function() {
                                        deleteSong(s._id, playlistName())
                                    }
                                }, 'Delete')
                              ])
                            ]),
                        ]
                    })
                ])
            ]),
            m('div', [
              m('a.btn.btn-primary', {
                  href: '/user/playlist/' + playlistName() + '/export1'
              }, 'Export Playlist'),
              m('button.btn.btn-default.pull-right', {onclick: function(){
                deletePlaylist(playlistName())
              }}, 'Delete Playlist')
            ])
        ]
    }
}

m.mount(document.getElementById('playlist'), playlistTable)
