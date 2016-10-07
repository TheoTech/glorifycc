var addOrDeleteButtonComponent = (function(){
  var addSong = function(id, url, inLibrary) {
      m.request({
          method: 'POST',
          url: url,
          data: {
              id: id
          }
      }).then(function(res) {
          res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
      })
  }

  var deleteSong = function(id, url, inLibrary) {
      m.request({
          method: 'DELETE',
          url: url,
          data: {
              id: id
          }
      }).then(function(res) {
          res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
      })
  }

  var addOrDeleteButton = {
    view: function(ctrl, args){
      return m('button.btn', {
          className: _.includes(args.inLibrary(), args.songID) ? 'btn-danger' : 'btn-success',
          onclick: function() {
              _.includes(args.inLibrary(), args.songID) ? deleteSong(args.songID, args.url, args.inLibrary) : addSong(args.songID, args.url, args.inLibrary)
          }
      }, _.includes(args.inLibrary(), args.songID) ? 'Delete from ' +  args.text : 'Add to ' + args.text)
    }
  }

  return {
    addOrDeleteButton: addOrDeleteButton
  }
})()
