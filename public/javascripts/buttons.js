//this is mithril component for buttons in the song clicked page
var buttons = function() {
    var buttonsComponent = {
        controller: function(args){
          args.label = m.prop('Add to Playlist')
          args.disabled = m.prop(false)
        },
        view: function(ctrl, args) {
            return [
                m(addOrDeleteButtonComponent.addOrDeleteButton, {
                    songID: args.songID,
                    url: '/',
                    inLibrary: args.inLibrary
                }),
                m('button.btn.btn-default', {
                    disabled: args.disabled(),
                    onclick: function() {
                        if (!isLoggedIn) {
                            window.location.href = '/user/login'
                        } else if (!args.playlistName()) {
                            $('#choosePlaylist' + args.modalName).modal('show')
                            args.addButtonDOM($(this))
                        } else {
                            args.playlistModal.addToPlaylist(args)
                        }
                    }
                }, args.label())
            ]
        }
    }

    return buttonsComponent
}
