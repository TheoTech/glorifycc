$.getScript('/javascripts/functionLibrary.js')

var inLibrary = m.prop(currentInLibrary)
var songs = m.prop(songs)

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
                                        return _.includes(inLibrary(), s._id) ? 'btn-danger' : 'btn-success'
                                    }(),
                                    onclick: function() {
                                        _.includes(inLibrary(), s._id) ? deleteSong(s._id) : addSong(s._id)
                                    }
                                }, function() {
                                    return _.includes(inLibrary(), s._id) ? 'Delete from Library' : 'Add to Library'
                                }())
                            ])
                        ])
                    })
                ])
            ])
        ]
    }
}

m.mount(document.getElementById('songTable'), songlistTable)
