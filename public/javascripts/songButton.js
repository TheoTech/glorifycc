$.getScript('/javascripts/functionLibrary.js')

var buttonComponent = {
  controller: function(){
    return {
      getClassName: function() {
          console.log()
          return _.includes(this.inLibrary()) ? 'btn-danger' : 'btn-success'
      },
      getButtonText: function() {
          return _.includes(this.inLibrary()) ? 'Delete from Library' : 'Add to Library'
      },
      inLibrary: m.prop([])
    }
  },
  view: function(vm, args) {
      return m('button.btn', {
          className: vm.getClassName.bind(vm),
          onclick: function() {
              _.includes(vm.inLibrary(), args._id) ? deleteSong(args._id) : addSong(args._id)
          }
      }, vm.getButtonText.bind(vm))
  }
}

m.mount(document.getElementById('song'), m(buttonComponent, song))
m.mount(document.getElementById('translation'), m(buttonComponent, translation))
