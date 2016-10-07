var addToPlaylistButtonComponent = (function() {
    var addToPlaylist = function(name, id) {
        m.request({
                method: 'POST',
                url: '/user/library',
                data: {
                    name: name,
                    id: id
                }
            })
            .then(function(data) {
                if (data.url) {
                    window.location.href = data.url
                }
            })
    }

    var addToPlaylistButton = {
        view: function(ctrl, args) {
            return m('button.btn.btn-default', {
                onclick: function() {
                    addToPlaylist(args.playlistName(), args.songID)
                }
            }, 'Add to Playlist')
        }
    }

    return {
        addToPlaylistButton: addToPlaylistButton
    }
}())
