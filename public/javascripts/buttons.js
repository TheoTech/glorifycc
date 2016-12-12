//this is mithril component for buttons in the song clicked page
var buttons = function() {
    var buttonsComponent = {
        controller: function(args){
          args.label = m.prop('Add to Playlist')
          args.disabled = m.prop(false)
        },
        view: function(ctrl, args) {
            return [
                m('button.btn.btn-success', {
                    disabled: args.disabled(),
                    onclick: function() {
                        if (!isLoggedIn) {
                            window.location.href = '/user/login'
                        } else if (!args.playlistName()) {
                            $('#choosePlaylist').modal('show')
                            args.addButtonDOM($(this))
                        } else {
                            args.playlistModal.addToPlaylist(args)
                        }
                    }
                }, args.label()),
                m('button.btn.btn-default', {
                    onclick: function() {
                        window.location.href = args.songID + '/add-translation'
                    }
                }, 'Add Translation')
            ]
        }
    }

    return buttonsComponent
}
