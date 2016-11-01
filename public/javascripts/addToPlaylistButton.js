var addToPlaylistButton = {
    view: function(ctrl, args) {
        return m('input.btn.btn-default[type=button]', {
            value: ctrl.btnText(),
            disabled: ctrl.disabled(),
            // config: function(elem, isInit) {
            //     if (!isInit) {
            //         if (!isLoggedIn) {
            //             window.location.href = '/user/login'
            //         } else if (!ctrl.playlistName) {
            //             document.getElementById('playlistDropdown').click()
            //         } else {
            //             ctrl.addToPlaylist()
            //         }
            //     }
            // }
            onclick: function() {
                if (!isLoggedIn) {
                    window.location.href = '/user/login'
                } else {
                    ctrl.addToPlaylist()
                }
            }
        })
    },
    controller: function(args) {
        this.btnText = args.label
        this.disabled = args.disabled
        this.playlistName = args.playlistName()
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
                    args.label('Added to ' + args.playlistName());
                    args.disabled(true);
                    setTimeout(() => {
                        args.label('Add to Playlist');
                        args.disabled(false);
                        m.redraw()
                    }, 3000);
                    // if (res.url) {
                    //     window.location.href = res.url
                    // } else {
                    //     args.label('Added to ' + args.playlistName());
                    //     args.disabled(true);
                    //     setTimeout(() => {
                    //         args.label('Add to Playlist');
                    //         args.disabled(false);
                    //         m.redraw()
                    //     }, 3000);
                    // }
                })
        }
        return this;
    }
}
