var songlistTableComponent = (function() {
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

    var inLibrary = m.prop(currentInLibrary)
    var songlistTable = {
        view: function() {
            // console.log(inLibrary())
            return [
                m('table.table', [
                    m('thead', [
                        m('th', 'Title'),
                        m('th', 'Author'),
                        m('th')
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
