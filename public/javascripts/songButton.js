$.getScript('/javascripts/functionLibrary.js')

var getClassName = function(id) {
    return _.includes(inLibrary(), id) ? 'btn-danger' : 'btn-success'
}

var getButtonText = function(id) {
    return _.includes(inLibrary(), id) ? 'Delete from Library' : 'Add to Library'
}

var inLibrary = m.prop()

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

m.mount(document.getElementById('song'), m(button, song))
m.mount(document.getElementById('translation'), m(button, translation))
