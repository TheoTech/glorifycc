//this function adds/deletes the song in the ExportSong collection
var pickTranslation = function(songID, translationID, checked) {
    if (checked) {
        console.log(translationID)
        m.request({
                method: 'POST',
                url: '/user/playlist/' + playlistName + '/export1',
                data: {
                    playlistID: playlistID,
                    songID: songID,
                    translationID: translationID
                }
            })
            .then(function(res) {
                console.log(res.msg)
            })
    } else {
        m.request({
                method: 'DELETE',
                url: '/user/playlist/' + playlistName + '/export1',
                data: {
                    playlistID: playlistID,
                    songID: songID,
                    translationID: translationID
                }
            })
            .then(function(res) {
                console.log(res.msg)
            })
    }

}

//this return the arr of languages to become table's headers
var langLabelArr = function(translations2d) {
    var lang = []
    translations2d.forEach((tr) => {
        tr.forEach((t, i) => {
            if (!_.includes(lang, t.lang)) {
                lang.push(t.lang)
            }
        })
    })
    return lang
}

var langOptions = langLabelArr(translations2d)


//select all checkbox
var selectAll = function(elem, checkboxClass) {
    $(elem).click(function() {
        $('.' + checkboxClass).trigger('click')
    });
}

//this function will check all the last exported songs
$(window).load(function() {
    langsPicked.forEach((lp) =>
        lp.forEach((l) => {
            $('#' + l).prop('checked', true)
        }))
})


//creating virtual DOM
var export1Table = {
    view: function() {
        return [
            m('table.table', [
                m('thead', [
                    m('th', 'Title'),
                    langOptions.map((l) => {
                        return m('th', l)
                    })
                ]),
                m('tbody', [
                    m('tr', [
                        m('td'),
                        langOptions.map((l) => {
                            return m('td', [
                                m('button.btn.btn-default.btn-sm', {
                                    config: function(elem, isInit, context) {
                                        if (!isInit) {
                                            selectAll(elem, l);
                                        }
                                    }
                                }, 'Select/Deselect All')
                            ])
                        })
                    ]),
                    songs.map((s, i) => {
                        return m('tr', [
                            m('td', [
                                m('a', {
                                    href: '/songlist/' + s._id
                                }, s.title)
                            ]),
                            langOptions.map((l) => {
                                console.log(langOptions)
                                return _.includes(translations2d[i].map((t) => t.lang), l) ? m('td', [
                                    m('input[type=checkbox]', {
                                        className: l,
                                        id: getTranslation(i, l)[0]._id,
                                        onclick: m.withAttr('checked', function(checked) {
                                            pickTranslation(s._id, getTranslation(i, l)[0]._id, checked)
                                        })
                                    })
                                ]) : m('td')
                            })
                        ])
                    })
                ])
            ])
        ]
    }
}


var getTranslation = function(idx, lang) {
    return translations2d[idx].filter((t) => t.lang === lang)
}

m.mount(document.getElementById('export1Table'), export1Table)
