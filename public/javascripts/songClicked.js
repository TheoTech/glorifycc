//this is mithril component for buttons in the song clicked page
var songClicked = (function() {
    var songPlaylistName = m.prop()
    var translationPlaylistName = m.prop()
    var addButtonDOM = m.prop()
    m.mount(document.getElementById('songPlaylistModal'), m(playlistModal.playlistModalComponent, {
            playlistName: songPlaylistName,
            addButtonDOM: addButtonDOM,
            modalName: 'song'
        }))
        // m.mount(document.getElementById('translationPlaylistModal'), m(playlistModal.playlistModalComponent, {
        //     playlistName: translationPlaylistName,
        //     addButtonDOM: addButtonDOM,
        //     modalName: 'translation'
        // }))
    m.mount(document.getElementById('song'), m(buttons(), {
        songID: song._id,
        addButtonDOM: addButtonDOM,
        playlistName: songPlaylistName,
        playlistModal: playlistModal,
        modalName: 'song',
        inLibrary: inLibrary
    }))
    m.mount(document.getElementById('chooseLanguage'), chooseLanguage())
        // if (translationExists) {
        //     m.mount(document.getElementById('translation'), m(buttons(), {
        //         songID: translation._id,
        //         addButtonDOM: addButtonDOM,
        //         playlistName: translationPlaylistName,
        //         playlistModal: playlistModal,
        //         modalName: 'translation',
        //         inLibrary: inLibrary
        //     }))
        // }
})()
