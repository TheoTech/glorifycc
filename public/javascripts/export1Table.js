var pickTranslation = function(songID, translationID, checked) {
    if (checked) {
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

var contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1,
                index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if ((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};



var langLabelArr = function(translationss) {
    var lang = []
    translationss.forEach((tr) => {
        tr.forEach((t, i) => {
            if (!contains.call(lang, t.lang)) {
                lang.push(t.lang)
            }
        })
    })
    return lang
}



console.log(langLabelArr(translationss))

var langOptions = langLabelArr(translationss)


var selectAll = function(elem, checkboxClass) {
        $(elem).click(function() {
            $('.' + checkboxClass).trigger('click')
        });
    }

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
                                m('td', s.title),
                                translationss[i].map((t) => {
                                    return langOptions.map((l) => {
                                        return t.lang === l ? m('td', [
                                            m('input[type=checkbox]', {
                                                class: t.lang,
                                                id: t.id,
                                                onclick: m.withAttr('checked', function(checked) {
                                                    pickTranslation(s._id, t._id, checked)
                                                })
                                            })
                                        ]) : m('td')
                                    })
                                })
                            ])
                        })
                    ])
                ])
            ]
        }
    }


m.mount(document.getElementById('export1Table'), export1Table)
