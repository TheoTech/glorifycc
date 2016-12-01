function songsNotFound() {
    return [
        m('h4', {
            style: {
                'margin-top': '35px'
            }
        }, 'Songs not found'),
        m('ul.list-inline', [
            m('li', [
                m('a.btn.btn-default', {
                    href: '/discover'
                }, 'Discover Songs')

            ]),
            m('li', [
                m('a.btn.btn-default', {
                    href: '/songlist-db/add'
                }, 'Contribute Songs')
            ])
        ])

    ]
}
