var playlist,
    openplaylist,
    closeplaylist,
    playlistContainer,

playlist = {};
playlist.view = function(ctrl, opts) {
  return m('.modal-dialog.modal-sm', [
    m('.modal-content', [
      m('.modal-header', [
        m('h4', 'Your Playlist', [
          m('button.btn.btn-default.pull-right', {onclick: function(e){
            openplaylist(e, {text: 'Opened from link'});
          }}, [
            m('span.glyphicon.glyphicon-plus')
          ])
        ])
      ]),
      m('.modal-body', [
        m('ul[style=list-style-type:none]', [
          m('li', 'Christmas Song'),
          m('li', 'Hymn Song')
        ])
      ])
    ])
  ])
}

closeplaylist = function(e) {
  m.mount(playlistContainer, null);
};

openplaylist = function(e, opts) {
  playlistContainer = document.getElementById('playlistContainer');
  if (!playlistContainer) {
    playlistContainer = document.createElement('div');
    playlistContainer.id = 'playlistContainer';
    document.body.appendChild(playlistContainer);
  }
  m.mount(playlistContainer, m.component(playlist, opts));
};

// console.log(JSON.stringify(songs))


// var setSong = function(id) {
//     // button.style.visibility = "hidden";
//     // console.log(JSON.stringify(id))
//     m.request({
//         method: 'POST',
//         url: '/songlist',
//         data: {
//             id: id
//         }
//     }).then(function(data) {
//         if (data.url) {
//             window.location.href = data.url
//         } else {
//             info(data.msg)
//             console.log(data.status)
//             infoStatus(data.status)
//         }
//     })
// }

var hideButton = function(elem) {
    $(elem).click(function(){
        console.log(infoStatus())
        $('#info').show()
        $("#info").fadeTo(1000, 500).slideUp(500, function(){
            $(this).slideUp(500);
        });
    })

}

// var info = m.prop()
// var infoStatus = m.prop('')

var library = {
    // info: m.prop('testtest'),
    view: function() {
        return [
          // m('#info.alert[style=display:none]', {class: infoStatus()}, info()),
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
                                m('button.btn.btn-warning', {
                                    onclick: function(e) {
                                      openplaylist(e, {id: s.id});
                                  }
                                }, 'Add to Playlist')
                            ])
                        ])
                    })
                ])
            ])
          ]
    }
}

m.mount(document.getElementById('library'), library)
