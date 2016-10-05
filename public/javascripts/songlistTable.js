var songlistTableComponent = (function() {

  var songID = m.prop()
    var addSong = function(id) {
        m.request({
            method: 'POST',
            url: '/songlist',
            data: {
                id: id
            }
        }).then(function(res) {
            res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
        })
    }

    var deleteSong = function(id) {
        m.request({
            method: 'DELETE',
            url: '/songlist',
            data: {
                id: id
            }
        }).then(function(res) {
            res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
        })
    }

    var addToPlaylist = function(name, id) {
        m.request({
                method: 'POST',
                url: '/user/library',
                data: {
                    name: name,
                    id: id
                }
            })
            .then(function(data) {
                if (data.url) {
                    window.location.href = data.url
                }
            })
    }

    var inLibrary = m.prop(currentInLibrary)
    var playlistName = m.prop()
    var songlistTable = {
        view: function() {
            return [
                m('table.table', [
                    m('thead', [
                        m('th', 'Title'),
                        m('th', 'Author'),
                        m('th'),
                        m('th', [
                          m('select.selectpicker', {
                              title: 'Choose Your Playlist',
                              onchange: function() {
                                  playlistName(this.value)
                              }
                          }, [
                              playlists.map((pl) => {
                                  return m('option', pl.name)
                              })
                          ])
                        ])
                    ]),
                    m('tbody', [
                        songs.map((s) => {
                            return m('tr', [
                                m('td', [
                                    m('a', {
                                        href: '/songlist/' + s._id
                                    }, s.title)
                                ]),
                                m('td', s.author),
                                m('td', [
                                    m('button.btn', {
                                        className: _.includes(inLibrary(), s._id) ? 'btn-danger' : 'btn-success',
                                        onclick: function() {
                                            _.includes(inLibrary(), s._id) ? deleteSong(s._id) : addSong(s._id)
                                        }
                                    }, _.includes(inLibrary(), s._id) ? 'Delete from Library' : 'Add to Library')
                                ]),
                                m('td', [
                                  m('button.btn.btn-default', {onclick: function(){
                                    addToPlaylist(playlistName(), s._id)
                                  }}, 'Add to Playlist')
                                ])
                            ])
                        })
                    ])
                ])
            ]
        }
    }
    return {
        init: function(dom) {
            m.mount(dom, songlistTable)
        }
    }
})()
