function songsNotFound() {
    return [
        m('h4', {
            style: {
                'margin-top': '35px'
            }
        }, 'Songs not found'),
        m('a.btn.btn-default', {
            href: '/discover'
        }, 'Discover Songs')
    ]
}
