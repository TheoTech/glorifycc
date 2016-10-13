var addToPlaylistButton = {
    view: function(ctrl) {
        return m('input.btn.btn-default[type=button]', {
            value: ctrl.btnText(),
            disabled: ctrl.disabled(),
            onclick: function() {
                ctrl.addToPlaylist()
            }
        })
    },
    controller: function(args) {
        this.btnText = args.label
        this.disabled = args.disabled
        this.addToPlaylist = () => {
            console.log(args.playlistName())
            m.request({
                    method: 'POST',
                    url: '/user/library',
                    data: {
                        name: args.playlistName(),
                        id: args.songID,
                        url: args.url
                    }
                })
                .then((res) => {
                    if (res.url) {
                        window.location.href = res.url
                    } else {
                        args.label('Added to ' + args.playlistName());
                        args.disabled(true);
                        setTimeout(() => {
                            args.label('Add to Playlist');
                            args.disabled(false);
                            m.redraw()
                        }, 3000);
                    }

                })
        }
        return this;
    }
}
