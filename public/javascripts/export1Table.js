// var songs = m.prop([])
// var playlistName = m.prop()

// console.log(songs)
// var temp = function(){
//   if (playlists[0]){
//     songs(playlists[0].songs)
//   } else {
//     songs([])
//   }
// }()



// $(window).unload(function(){
//     alert('Are you sure you want to leave? The translations you picked will be lost')
//
// });

var pickTranslation = function(songID, translationID, checked) {
    // console.log(id)
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

    // .then(function(res) {
    //     console.log(JSON.stringify(res))
    //     songs(res.songs)
    //     playlistName(res.name)
    // })
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






// var showtab = function(elem) {
//     $(elem.click(function() {
//         $(this).tab('show')
//     }))
// }


// window.onload = function() {
//     if (document.getElementById('0')) {
//         document.getElementById('0').click();
//     }
// };


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
    // console.log(contains.call(['english', 'spanish'], 'english'))

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
                                    // console.log('t.lang: ' + t.lang)
                                    return langOptions.map((l) => {
                                        // console.log('lang: ' + l)
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
    // m('#info.alert[style=display:none]', {class: infoStatus()}, info()),

// m('table.table', [
//     m('thead', [
//         m('th', 'Title'),
//         m('th', 'Author'),
//         m('th')
//     ]),
//     m('tbody', [
//         songs.map((s) => {
//             // console.log(JSON.stringify(s))
//             return m('tr', [
//                 m('td', s.title),
//                 m('td', s.author),
//                 m('td', [
//                     m('button.btn.btn-warning', {
//                         onclick: function() {
//                             songID(s._id)
//                         },
//                         'data-toggle': 'modal',
//                         'data-target': '#existingPlaylist'
//
//                     }, 'Add to Playlist')
//                 ])
//             ])
//         })
//     ])
// ])
m.mount(document.getElementById('export1Table'), export1Table)
