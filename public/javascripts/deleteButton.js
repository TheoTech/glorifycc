var deleteButtonComponent = (function(){
  var deleteSong = function(id, url, songs, name) {
      //'name' parameter is only for delete button in the playlist page because in this case, we need to know in what playlist
      //the song will be deleted
      m.request({
              method: 'DELETE',
              url: url,
              data: {
                  id: id,
                  name: name
              }
          })
          .then(function(data) {
              songs(data.songs)
          })
  }

  var deleteButton = {
    view: function(ctrl, args){
      return m('button.btn.btn-default', {
          onclick: function() {
              deleteSong(args.songID, args.url, args.songs, args.name)
          }
      }, [
        m('i.glyphicon.glyphicon-remove')
      ])
    }
  }

  return {
    deleteButton: deleteButton,
  }
})()
