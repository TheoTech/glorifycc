var addOrDeleteSong = function(id) {
    m.request({
        method: 'POST',
        url: '/songlist',
        data: {
            id: id
        }
    }).then(function(res) {
        if (res.url) {
            window.location.href = res.url
        } else {
            inLibrary(res.inLibrary)
        }

    })
}

var inLibrary = m.prop(currentInLibrary)

var songlistTable = {
    view: function() {
        return [
            m('table.table', [
                m('thead', [
                    m('th', 'Title'),
                    m('th', 'Author'),
                    m('th')
                ]),
                m('tbody', [
                    songs().map((s) => {
                        return m('tr', [
                            m('td', [
                                m('a', {
                                    href: '/songlist/' + s._id
                                }, s.title)
                            ]),
                            m('td', s.author),
                            m('td', [
                                m('button.btn', {
                                    className: function() {
                                        if (_.includes(inLibrary(), s._id)) {
                                            return 'btn-danger'
                                        } else {
                                            return 'btn-success'
                                        }
                                    }(),
                                    onclick: function() {
                                        addOrDeleteSong(s._id)
                                    }
                                }, function() {
                                    if (_.includes(inLibrary(), s._id)) {
                                        return 'Delete from Library'
                                    } else {
                                        return 'Add to Library'
                                    }
                                }())
                            ])
                        ])
                    })
                ])
            ])
        ]
    }
}



var filterSong = function(tag) {
    m.request({
            method: 'PUT',
            url: '/songlist',
            data: {
                tag: tag
            }
        })
        .then(function(res) {
            songs(res.songs)
            inLibrary(res.inLibrary)
        })

}

var enter = function(elem, checkboxClass) {
    $(elem).keyup(function(e) {
        if (e.keyCode == 13) {
            $("#search-button").click()
        }
    })
}


var tag = m.prop('')
var songs = m.prop(songs)
var searchBox = {
    view: function() {
        return m('.input-group[style=width: 30em]', [
            m('input#search-input.form-control[type=text]', {
                placeholder: 'Language, Title, Author or Lyric',
                onchange: m.withAttr('value', tag),
                config: function(elem, isInit, context) {
                    if (!isInit) {
                        enter(elem);
                    }
                }
            }),
            m('span.input-group-btn', [
                m('button#search-button.btn.btn-success', {
                    onclick: function() {
                        filterSong(tag())
                    }
                }, [
                    m('i.glyphicon.glyphicon-search')
                ])
            ])
        ])
    }
}

m.mount(document.getElementById('searchBox'), searchBox)
m.mount(document.getElementById('songTable'), songlistTable)
