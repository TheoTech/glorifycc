function selectPlaylist() {
    function button(args) {
        return m('button.btn.btn-default', {
            onclick: function() {
                //isLoggedIn is defined on the index.jade
                if (!isLoggedIn) {
                    window.location.href = '/user/login'
                } else {
                    $('#choosePlaylist').modal('show')
                    args.addButtonDOM($(this))
                }
            }
        }, args.playlistName() ? 'Selected Playlist: ' + args.playlistName() : 'Select Playlist')
    }

    var selectPlaylistComponent = {
        view: function(ctrl, args) {
            return button(args)
        }
    }

    return selectPlaylistComponent
}
