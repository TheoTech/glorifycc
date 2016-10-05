//this function will check all the last exported songs
$(window).load(function() {
    exportSongCollection.map((es) => es.translations.map((t) => t))
        .forEach((translationID) => {
            $('#' + translationID).prop('checked', true)
        })
})


var exportSong = function(songID, translationID) {
    this.song = songID
    this.translations = []
    this.translations.push(translationID)
}


//this function adds/deletes the song in the ExportSong collection
var pickTranslation = function(songID, translationID, checked) {
    var idx = _.findIndex(exportSongCollection, (e) => e.song === songID)

    if (checked) {
        //add
        exportSongCollection[idx].translations.push(translationID)
    } else {
        //delete
        _.remove(exportSongCollection[idx].translations, (t) => t === translationID)

        //remove the exportSong obj if the user doesnt pick any translation for a particular song
        if (_.isEmpty(exportSongCollection[idx].translations)) {
            exportSongCollection.splice(idx, 1)
        }
    }
    console.log(exportSongCollection)
}


var postExportSongCollection = function(exportSongCollection) {
    m.request({
            method: 'POST',
            url: '/user/playlist/' + playlistName + '/export1',
            data: {
                obj: exportSongCollection,
                playlistID: playlistID
            }
        })
        .then(function(res) {
            window.location.href = '/user/playlist/' + playlistName + '/export3'
        })
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

var getTranslation = function(idx, lang) {
    return translations2d[idx].filter((t) => t.lang === lang)
}


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
                                // console.log(langOptions)
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
            ]),
            m('button.btn.btn-primary', {
                onclick: function() {
                    postExportSongCollection(exportSongCollection)
                }
            }, 'Next')
        ]
    }
}




m.mount(document.getElementById('export1Table'), export1Table)
