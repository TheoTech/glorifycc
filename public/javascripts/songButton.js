var addOrDeleteSong = function(id) {
    m.request({
        method: 'POST',
        url: '/songlist',
        data: {
            id: id
        }
    }).then(function(res) {
        if (res.url) {
            window.location.href = res.url
        } else {
            inLibrary(res.inLibrary)
        }

    })
}

var inLibrary = m.prop()
var songButton = {
    view: function() {
        return m('button.btn', {
            className: function() {
                if (_.includes(inLibrary(), song._id)) {
                    return 'btn-danger'
                } else {
                    return 'btn-success'
                }
            }(),
            onclick: function() {
                addOrDeleteSong(song._id)
            }
        }, function() {
            if (_.includes(inLibrary(), song._id)) {
                return 'Delete from Library'
            } else {
                return 'Add to Library'
            }
        }())
    }
}

var transButton = {
    view: function() {
        return m('button.btn', {
            class: function() {
                if (_.includes(inLibrary(), translation._id)) {
                    return 'btn-danger'
                } else {
                    return 'btn-success'
                }
            }(),
            onclick: function() {
                addOrDeleteSong(translation._id)
            }
        }, function() {
            if (_.includes(inLibrary(), translation._id)) {
                return 'Delete from Library'
            } else {
                return 'Add to Library'
            }
        }())
    }
}
// var songlistTable = {
//     view: function() {
//         return [
//             m('table.table', [
//                 m('thead', [
//                     m('th', 'Title'),
//                     m('th', 'Author'),
//                     m('th')
//                 ]),
//                 m('tbody', [
//                     songs().map((s) => {
//                         return m('tr', [
//                             m('td', [
//                                 m('a', {
//                                     href: '/songlist/' + s._id
//                                 }, s.title)
//                             ]),
//                             m('td', s.author),
//                             m('td', [
//                                 m('button.btn', {
//                                     class: function() {
//                                         if (_.includes(inLibrary(), s._id)) {
//                                             return 'btn-danger'
//                                         } else {
//                                             return 'btn-success'
//                                         }
//                                     }(),
//                                     onclick: function() {
//                                         addOrDeleteSong(s._id)
//                                     }
//                                 }, function() {
//                                     if (_.includes(inLibrary(), s._id)) {
//                                         return 'Delete from Library'
//                                     } else {
//                                         return 'Add to Library'
//                                     }
//                                 }())
//                             ])
//                         ])
//                     })
//                 ])
//             ])
//         ]
//     }
// }
//
//
//
//
// var setSong = function(id) {
//     m.request({
//             method: 'POST',
//             url: '/songlist',
//             data: {
//                 id: id
//             }
//         })
//         .then(function(data) {
//             if (data.url) {
//                 window.location.href = data.url
//             } else {
//                 info(data.msg)
//                 console.log(data.msg)
//                 console.log(data.status)
//                 infoStatus(data.status)
//             }
//         })
// }
// var showInfo = function(elem) {
//     $(elem).click(function() {
//         console.log(infoStatus())
//         $('#info').show()
//         $("#info").fadeTo(1000, 500).slideUp(500, function() {
//             $(this).slideUp(500);
//         });
//     })
//
// }
// var info = m.prop()
// var infoStatus = m.prop('')

m.mount(document.getElementById('song'), songButton)
m.mount(document.getElementById('translation'), transButton)
