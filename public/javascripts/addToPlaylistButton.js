var addToPlaylistButton = {
    view: function(ctrl, args) {
        return m('input.btn.btn-default[type=button]', {
            value: args.label(),
            disabled: args.disabled(),
            onclick: function() {
                if (!isLoggedIn) {
                    window.location.href = '/user/login'
                } else if (!args.playlistName()) {
                    $('#choosePlaylist').modal('show')
                    args.addButtonDOM($(this))
                } else {
                    ctrl.addToPlaylist()
                }
            }
        })
    },
    controller: function(args) {
        this.addToPlaylist = () => {
            m.request({
                    method: 'POST',
                    url: '/user/library',
                    data: {
                        name: args.playlistName(),
                        id: args.songID
                    }
                })
                .then((res) => {
                    args.label('Added to ' + args.playlistName());
                    args.disabled(true);
                    setTimeout(() => {
                        args.label('Add to Playlist');
                        args.disabled(false);
                        m.redraw()
                    }, 3000);
                })
        }
        return this;
    }
}
