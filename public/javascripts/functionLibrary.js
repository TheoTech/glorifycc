var addSong = function(id) {
    m.request({
        method: 'POST',
        url: '/songlist',
        data: {
            id: id
        }
    }).then(function(res) {
        res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
    })
}

var deleteSong = function(id) {
    m.request({
        method: 'DELETE',
        url: '/songlist',
        data: {
            id: id
        }
    }).then(function(res) {
        res.url ? window.location.href = res.url : inLibrary(res.inLibrary)
    })
}
