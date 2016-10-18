//this is mithril component for buttons in the song clicked page
var songPageButtonsComponent = (function() {
    var playlistName = m.prop()
    var buttons = {
        view: function(ctrl, args) {
            return [
                m(addOrDeleteButtonComponent.addOrDeleteButton, {
                    songID: args._id,
                    text: 'Library',
                    url: '/',
                    inLibrary: inLibrary,
                }),
                m('br'),
                m(playlistDropdownComponent.playlistDropdown, {
                    playlistName: playlistName,
                    url: '/' + args._id
                }),
                m(addToPlaylistButtonComponent.addToPlaylistButton, {
                    playlistName: playlistName,
                    songID: args._id,
                    url: '/' + args._id
                })
            ]
        }
    }

    return {
        buttons: buttons
    }
})()
