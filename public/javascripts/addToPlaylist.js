// console.log(JSON.stringify(songs))


var setSong = function(id) {
    // button.style.visibility = "hidden";
    // console.log(JSON.stringify(id))
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

var hideButton = function(elem) {
    $(elem).click(function(){
        console.log(infoStatus())
        $('#info').show()
        $("#info").fadeTo(1000, 500).slideUp(500, function(){
            $(this).slideUp(500);
        });
    })

}

var info = m.prop()
var infoStatus = m.prop('')

var addToPlaylist = {
    // info: m.prop('testtest'),
    view: function() {
        return [
          m('#info.alert[style=display:none]', {class: infoStatus()}, info()),
          // m('#fail.alert.alert-danger[style=display:none]', info()),
        m('table.table', [
                m('thead', [
                    m('th', 'Title'),
                    m('th', 'Author'),
                    m('th')
                ]),
                m('tbody', [
                    songs.map((s) => {
                        // console.log(JSON.stringify(s))
                        return m('tr', [
                            m('td', s.title),
                            m('td', s.author),
                            m('td', [
                                m('button.btn.btn-success', {
                                    config: function(elem, isInit, context) {
                                        if (!isInit) {
                                            hideButton(elem);
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

m.mount(document.getElementById('song-table'), addToPlaylist)
