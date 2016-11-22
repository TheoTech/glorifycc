function addToPlaylistButton() {
    var addToPlaylistButtonComponent = {
        view: function(ctrl, args) {
            return m('div', [
                m('input.btn.btn-default[type=button]', {
                    value: args.label(),
                    disabled: args.disabled(),
                    onclick: function() {
                        if (!isLoggedIn) {
                            window.location.href = '/user/login'
                        } else if (!args.playlistName()) {
                            $('#choosePlaylist').modal('show')
                            args.addButtonDOM($(this))
                        } else {
                            console.log(args.playlistModal)
                            args.playlistModal.addToPlaylist(args)
                        }
                    }
                })
            ])
        }
    }

    return addToPlaylistButtonComponent
}
