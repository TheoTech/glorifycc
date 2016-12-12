//this is mithril component for buttons in the song clicked page
var songClicked = (function() {
    var songPlaylistName = m.prop()
    var translationPlaylistName = m.prop()
    var addButtonDOM = m.prop()
    m.mount(document.getElementById('songPlaylistModal'), m(playlistModal.playlistModalComponent, {
        playlistName: songPlaylistName,
        addButtonDOM: addButtonDOM,
    }));
    m.mount(document.getElementById('groupSong'), m(buttons(), {
        songID: leftSong._id,
        addButtonDOM: addButtonDOM,
        playlistName: songPlaylistName,
        playlistModal: playlistModal,
        inLibrary: inLibrary
    }));
    m.mount(document.getElementById('chooseLanguage'), chooseLanguage());
    m.mount(document.getElementById('leftSongLikeButton'), m(addOrDeleteButtonComponent.addOrDeleteButton, {
        songID: leftSong._id,
        url: '/',
        inLibrary: inLibrary,
        className: 'btn-sm'
    }));
    m.mount(document.getElementById('rightSongLikeButton'), m(addOrDeleteButtonComponent.addOrDeleteButton, {
        songID: rightSong._id,
        url: '/',
        inLibrary: inLibrary,
        className: 'btn-sm'
    }));
})()
