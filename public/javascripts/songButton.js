var addOrDeleteSong = function(id) {
    m.request({
        method: 'POST',
        url: '/songlist',
        data: {
            id: id
        }
    }).then(function(res) {
        if (res.url) {
            window.location.href = res.url
        } else {
            inLibrary(res.inLibrary)
        }

    })
}

var inLibrary = m.prop()

//add/delete song button for the songlicked page
var songButton = {
    view: function() {
        return m('button.btn', {
            className: function() {
                if (_.includes(inLibrary(), song._id)) {
                    return 'btn-danger'
                } else {
                    return 'btn-success'
                }
            }(),
            onclick: function() {
                addOrDeleteSong(song._id)
            }
        }, function() {
            if (_.includes(inLibrary(), song._id)) {
                return 'Delete from Library'
            } else {
                return 'Add to Library'
            }
        }())
    }
}

//add/delete translation button for the songclicked page
var transButton = {
    view: function() {
        return m('button.btn', {
            class: function() {
                if (_.includes(inLibrary(), translation._id)) {
                    return 'btn-danger'
                } else {
                    return 'btn-success'
                }
            }(),
            onclick: function() {
                addOrDeleteSong(translation._id)
            }
        }, function() {
            if (_.includes(inLibrary(), translation._id)) {
                return 'Delete from Library'
            } else {
                return 'Add to Library'
            }
        }())
    }
}

m.mount(document.getElementById('song'), songButton)
m.mount(document.getElementById('translation'), transButton)
