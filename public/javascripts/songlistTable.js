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
            console.log(inLibrary())
        }

    })
}

// var buttonText = function(id){
//   // console.log('hehehe')
//   if (_.includes(inLibrary, id)){
//     // console.log('exist')
//     return m.prop('Delete from Library')
//   } else {
//     // console.log(id)
//     // console.log('doesnt exist')
//     return m.prop('Add to Library')
//   }
// }

var inLibrary = m.prop(currentInLibrary)

// var setID = m.prop()
// var buttonText = m.prop(
//   _.includes(inLibrary, setID()) ? 'Delete from Library' : 'Add to Library'
// )
// var buttonColor = m.prop(
//   _.includes(inLibrary, setID()) ? 'btn-danger' : 'btn-success'
// )





// var buttonColor = function(id){
//   if (){
//     return m.prop('btn-danger')
//   } else {
//     return m.prop('btn-success')
//   }
// }

var songlistTable = {
    view: function() {
        return [
            // m('#info.alert[style=display:none]', {
            //     class: infoStatus()
            // }, info()),

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
                                m('button.btn', {
                                    class: function(){
                                      if (_.includes(inLibrary(), s._id)){
                                        return 'btn-danger'
                                      } else {
                                        return 'btn-success'
                                      }
                                    }(),
                                    onclick: function() {
                                        // setID(s._id)
                                        addOrDeleteSong(s._id)
                                    }
                                }, function(){
                                  if (_.includes(inLibrary(), s._id)){
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

m.mount(document.getElementById('song-table'), songlistTable)
