$.getScript('/javascripts/funcLib.js')

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
                                        if (_.includes(inLibrary(), s._id)) {
                                            return 'btn-danger'
                                        } else {
                                            return 'btn-success'
                                        }
                                    }(),
                                    onclick: function() {
                                        if (_.includes(inLibrary(), s._id)) {
                                            deleteSong(s._id)
                                        } else {
                                            addSong(s._id)
                                        }
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

m.mount(document.getElementById('songTable'), songlistTable)
