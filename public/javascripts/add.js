//to show one stanza box on the form
song.lyric.push([''])
var obj = {
    song: song,
    url: '/songlist-db/add',
    readonly: false,
    submitButton: true,
    formID: ''
}
m.mount(document.getElementById('addSong'), songForm(obj).songFormComponent)
