var buttonComponent = (function () {
  var addSong = function(id) {
      m.request({
          method: 'POST',
          url: '/songlist',
          data: {
              id: id
          }
      }).then(function(res) {
          res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
          // console.log(res.inLibrary)
      })
  }

  var deleteSong = function(id) {
      m.request({
          method: 'DELETE',
          url: '/songlist',
          data: {
              id: id
          }
      }).then(function(res) {
          res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
      })
  }
  var inLibrary = m.prop()
  var getClassName = function(id) {
      return _.includes(inLibrary(), id) ? 'btn-danger' : 'btn-success'
  }

  var getButtonText = function(id) {
      return _.includes(inLibrary(), id) ? 'Delete from Library' : 'Add to Library'
  }

  // $.getScript('/javascripts/functionLibrary.js')
  var button = {
      view: function(ctrl, args) {
          return m('button.btn', {
              className: getClassName(args._id),
              onclick: function() {
                  _.includes(inLibrary(), args._id) ? deleteSong(args._id) : addSong(args._id)
              }
          }, getButtonText(args._id))
      }
  }

  return {
    init: function (songButtonDOM, translationButtonDOM, song, translation) {
      m.mount(songButtonDOM, m(button, song))
      if (translationButtonDOM){
        m.mount(translationButtonDOM, m(button, translation))
      }
    }
  }
})()

var songButtonDOM = document.getElementById('song')
var translationButtonDOM = document.getElementById('translation')
buttonComponent.init(songButtonDOM, translationButtonDOM, song, translation)
