var export1TableComponent = (function() {
    //Note: var uniqueLanguages, var songs, var playlistName are defined on export1.jade

    var saveTranslationsChecked = function(songs) {

        m.request({
                method: 'POST',
                url: '/user/playlist/' + encodeURIComponent(playlistName) + '/export1',
                data: songs
            })
            .then(function(res) {
                window.location.href = '/user/playlist/' + encodeURIComponent(playlistName)+ '/export3'
            })
    }

    var selectAll = function(elem, lang) {
        $('.' + lang).each(function(i, obj) {
            if ($(obj).prop('checked') !== $(elem).prop('checked')) {
                $(obj).trigger('click');
            }
        })
    }

    var export1Table = {
        view: function() {
            return [
                m('table.table', [
                    m('thead', [
                        m('th', 'Title'),
                        uniqueLanguages.map((lang) => {
                            return m('th.capitalize.text-center', {
                                margin: 'auto'
                            }, lang)
                        })
                    ]),
                    m('tbody', [
                        m('tr', [
                            m('td'),
                            uniqueLanguages.map((lang) => {
                                return m('td.text-center', {
                                    margin: 'auto'
                                }, [
                                    m('input', {
                                        type: 'checkbox',
                                        onclick: function() {
                                            selectAll(this, lang)
                                        }
                                    })
                                ])
                            })
                        ]),
                        songs.map((song, i) => {
                            return m('tr', [
                                m('td', song.song.title),
                                uniqueLanguages.map((lang, j) => {
                                    var rightSong = song.availableTranslations.find((availableTranslation) => availableTranslation.lang === lang)
                                    var songID = rightSong ? rightSong._id : ''
                                    return m('td.text-center', [
                                        m('input', {
                                            className: lang,
                                            id: rightSong ? songID : '',
                                            type: 'checkbox',
                                            disabled: rightSong ? false : true,
                                            checked: _.includes(song.translationsChecked, songID) ? true : false,
                                            onclick: function() {
                                                if (this.checked) {
                                                    song.translationsChecked.push(songID)
                                                    console.log(song.translationsChecked)
                                                } else {
                                                    _.remove(song.translationsChecked, (n) => n === songID)
                                                }
                                            }
                                        })
                                    ])
                                })
                            ])
                        })
                    ])
                ]),
                m('button.btn.btn-primary', {
                    onclick: function() {
                        saveTranslationsChecked(songs.map((song) => {
                            return {
                                song: song.song._id,
                                translationsChecked: song.translationsChecked
                            }
                        }))
                    }
                }, 'Next')
            ]
        }
    }

    return {
        init: function(dom) {
            m.mount(dom, export1Table)
        }
    }
})()
