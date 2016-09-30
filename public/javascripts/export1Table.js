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


var langLabelArr = function(translationss) {
    var lang = []
    translationss.forEach((tr) => {
        tr.forEach((t, i) => {
            if (!_.includes(lang, t.lang)) {
                lang.push(t.lang)
            }
        })
    })
    return lang
}

var langOptions = langLabelArr(translationss)


var selectAll = function(elem, checkboxClass) {
    $(elem).click(function() {
        $('.' + checkboxClass).trigger('click')
    });
}

$(window).load(function() {
    langsPicked.forEach((lp) =>
        lp.forEach((l) => {
            $('#' + l).prop('checked', true)
        }))
})


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
                                return _.includes(translationss[i].map((t) => t.lang), l) ? m('td', [
                                    m('input[type=checkbox]', {
                                        class: l,
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
    return translationss[idx].filter((t) => t.lang === lang)
}

m.mount(document.getElementById('export1Table'), export1Table)
