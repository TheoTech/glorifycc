var setSong = function(id) {
    m.request({
        method: 'POST',
        url: '/songlist',
        data: {
            id: id
        }
    }).then(function(data) {
        if (data.url) {
            window.location.href = data.url
        } else {
            info(data.msg)
            console.log(data.status)
            infoStatus(data.status)
        }
    })
}

var showInfo = function(elem) {
    $(elem).click(function() {
        console.log(infoStatus())
        $('#info').show()
        $("#info").fadeTo(1000, 500).slideUp(500, function() {
            $(this).slideUp(500);
        });
    })

}

var info = m.prop()
var infoStatus = m.prop('')

var songlistTable = {
    view: function() {
        return [
            m('#info.alert[style=display:none]', {
                class: infoStatus()
            }, info()),

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
                                m('button.btn.btn-success', {
                                    config: function(elem, isInit, context) {
                                        if (!isInit) {
                                            showInfo(elem);
                                        }
                                    },
                                    onclick: function() {
                                        setSong(s._id)
                                    }
                                }, 'Add to Library')
                            ])
                        ])
                    })
                ])
            ])
        ]
    }
}

m.mount(document.getElementById('song-table'), songlistTable)
